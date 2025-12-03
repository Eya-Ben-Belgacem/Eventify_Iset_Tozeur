import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { environment } from '../../../environments/environment';

export interface SimpleEvent {
  id?: string;
  title: string;
  description?: string;
  date?: any;
  participants?: any[];
}

@Injectable({ providedIn: 'root' })
export class AiRecommendationService {
  private openAiKey = (environment as any).openaiApiKey || '';

  constructor(private firestore: Firestore) {}

  /**
   * Retourne une liste d'événements recommandés pour un utilisateur.
   * Si une clé OpenAI est configurée, essaie d'utiliser l'API OpenAI (chat completion)
   * sinon utilise un algorithme local simple basé sur intérêts/utilité.
   */
  async recommendForUser(userId: string | null, events: SimpleEvent[], max = 5): Promise<SimpleEvent[]> {
    // Load user profile (may contain `interests` field)
    let userInterests: string | null = null;
    if (userId) {
      try {
        const userRef = doc(this.firestore, `users/${userId}`);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data() as any;
          userInterests = data.interests || data.bio || null;
        }
      } catch (err) {
        console.warn('Could not load user profile for recommendations', err);
      }
    }

    // If OpenAI key is configured, try to call the API to rank events
    if (this.openAiKey) {
      try {
        const ranked = await this.rankWithOpenAi(userInterests, events, max);
        if (ranked && ranked.length) return ranked;
      } catch (err) {
        console.warn('OpenAI recommendation failed, falling back to local method', err);
      }
    }

    // Fallback: local scoring
    return this.localRecommend(userInterests, events, max);
  }

  private async rankWithOpenAi(userInterests: string | null, events: SimpleEvent[], max: number) {
    // Build a concise prompt asking the model to return top event ids (comma-separated)
    const items = events.map(e => `ID:${e.id} TITLE:${e.title} DESC:${(e.description || '').slice(0,120)}`).join('\n');
    const prompt = `You are an assistant that recommends the most relevant events for a user based on their interests.\nUser interests: ${userInterests || 'none'}\n\nEvents:\n${items}\n\nReturn the IDs of the top ${max} events (most relevant first) as a JSON array.`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openAiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 200
      })
    });

    if (!resp.ok) throw new Error(`OpenAI error: ${resp.status}`);
    const data = await resp.json();
    const txt = (data?.choices?.[0]?.message?.content || '') as string;

    // Try to parse JSON array in the response
    const ids = this.extractIdsFromText(txt);
    if (!ids.length) return [];
    const ordered = ids.map(id => events.find(e => e.id === id)).filter(Boolean) as SimpleEvent[];
    return ordered.slice(0, max);
  }

  private extractIdsFromText(text: string): string[] {
    try {
      const jsonStart = text.indexOf('[');
      if (jsonStart >= 0) {
        const json = text.slice(jsonStart);
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) return parsed.map(String);
      }
    } catch (err) {
      // ignore
    }
    // Fallback: extract tokens like ID:xxx
    const ids: string[] = [];
    const re = /ID:([A-Za-z0-9_-]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) ids.push(m[1]);
    return ids;
  }

  private localRecommend(interests: string | null, events: SimpleEvent[], max: number): SimpleEvent[] {
    const scores = events.map(e => {
      let score = 0;
      // prefer future events (closer date)
      if (e.date) {
        const d = new Date(e.date).getTime();
        const now = Date.now();
        const days = Math.max(1, Math.round((d - now) / (1000 * 60 * 60 * 24)));
        score += Math.max(0, 30 - days); // nearer events score higher
      }
      // participants weight
      score += (e.participants?.length ?? 0) * 2;
      // keyword match with interests
      if (interests) {
        const kws = interests.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        const text = (e.title + ' ' + (e.description || '')).toLowerCase();
        for (const kw of kws) if (text.includes(kw)) score += 10;
      }
      return { e, score };
    });

    return scores.sort((a, b) => b.score - a.score).slice(0, max).map(s => s.e);
  }
}
