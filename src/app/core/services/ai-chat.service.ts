import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private openAiKey = (environment as any).openaiApiKey || '';

  constructor(private firestore: Firestore) {}

  /**
   * Simple chat responder: forwards question and context to OpenAI if key present,
   * otherwise responds with a lightweight local heuristic based on event titles/descriptions.
   */
  async ask(userId: string | null, question: string, eventsContext: { id?: string; title: string; description?: string }[]): Promise<string> {
    // Load minimal user info for personalization (optional)
    let userName = '';
    if (userId) {
      try {
        const ref = doc(this.firestore, `users/${userId}`);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          userName = data.name || '';
        }
      } catch (err) {
        // ignore
      }
    }

    // Build a compact context string
    const ctx = eventsContext.slice(0, 8).map(e => `ID:${e.id} TITLE:${e.title} DESC:${(e.description || '').slice(0,120)}`).join('\n');

    if (this.openAiKey) {
      try {
        const system = `You are an assistant that helps users understand the interest and relevance of events. Use the provided event list to answer the user's question concisely and suggest up to 3 relevant events by ID and title.`;
        const userPrompt = `User: ${userName || 'anonymous'}\nQuestion: ${question}\n\nEvents:\n${ctx}\n\nAnswer:`;

        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openAiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.6,
            max_tokens: 400
          })
        });

        if (!resp.ok) throw new Error(`OpenAI error ${resp.status}`);
        const data = await resp.json();
        return data?.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas de réponse.';
      } catch (err) {
        console.warn('OpenAI chat failed, falling back:', err);
      }
    }

    // Local fallback: naive keyword matching
    const q = question.toLowerCase();
    const matches = eventsContext.map(e => {
      const text = (e.title + ' ' + (e.description || '')).toLowerCase();
      let score = 0;
      if (q.includes('musique') && text.includes('musique')) score += 5;
      if (q.includes('atelier') && text.includes('atelier')) score += 5;
      if (q.includes('gratuit') && text.includes('gratuit')) score += 3;
      // generic overlap
      const qWords = q.split(/[^a-z0-9]+/).filter(Boolean);
      for (const w of qWords) if (text.includes(w)) score += 1;
      return { e, score };
    }).sort((a, b) => b.score - a.score);

    const top = matches.filter(m => m.score > 0).slice(0,3);
    if (!top.length) return 'Je n\'ai rien trouvé de très pertinent. Essayez une autre question (ex: "Quels événements de musique cette semaine?")';
    const lines = top.map(t => `- ${t.e.title} (ID:${t.e.id})`);
    return `Voici des événements qui semblent correspondre à votre question:\n${lines.join('\n')}`;
  }
}
