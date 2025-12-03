import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AiChatService } from '../../services/ai-chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="ai-chat-card">
      <h3>Assistant IA — Posez une question</h3>
      <div class="messages">
        <div *ngFor="let m of messages" class="msg">
          <strong *ngIf="m.role==='user'">Vous:</strong>
          <strong *ngIf="m.role==='assistant'">IA:</strong>
          <div class="text">
            <ng-container *ngIf="m.parts?.length; else plain">
              <ng-container *ngFor="let p of m.parts">
                <span *ngIf="p.type==='text'">{{ p.text }}</span>
                <a *ngIf="p.type==='link'" [routerLink]="['/event', p.id]" class="ai-link">{{ p.text }}</a>
              </ng-container>
            </ng-container>
            <ng-template #plain>{{ m.text }}</ng-template>
          </div>
        </div>
      </div>

      <div class="composer">
        <input matInput placeholder="Posez une question sur les événements..." [(ngModel)]="query" (keyup.enter)="send()" />
        <button mat-raised-button color="primary" (click)="send()">Envoyer</button>
      </div>
    </mat-card>
  `,
  styles: [
    `
    .ai-chat-card { padding: 12px; max-width: 480px; }
    .messages { max-height: 240px; overflow:auto; display:flex; flex-direction:column; gap:8px; margin-bottom:8px; }
    .msg { background:#f5f5f5; padding:8px; border-radius:6px; }
    .msg strong { display:block; font-size:0.85rem; color:#333; }
    .composer { display:flex; gap:8px; }
    input[matinput] { flex:1; }
    `
  ]
})
export class AiChatComponent implements OnInit {
  @Input() events: { id?: string; title: string; description?: string }[] = [];
  query = '';
  messages: { role: 'user' | 'assistant'; text: string; parts?: Array<{ type: 'text' | 'link'; text: string; id?: string }> }[] = [];

  private storageKey = 'ai_chat_history_v1';

  constructor(private aiChat: AiChatService, private auth: AuthService) {}

  ngOnInit() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as any[];
        this.messages = parsed;
      }
    } catch (err) {
      // ignore parse errors
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    } catch (err) {
      console.warn('Could not save chat history', err);
    }
  }

  private parseAssistantText(text: string) {
    // Build parts: split on tokens like ID:abc123 and render them as links
    const parts: Array<{ type: 'text' | 'link'; text: string; id?: string }> = [];
    const re = /ID:([A-Za-z0-9_-]+)/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > lastIndex) {
        parts.push({ type: 'text', text: text.slice(lastIndex, m.index) });
      }
      parts.push({ type: 'link', text: `Voir événement (${m[1]})`, id: m[1] });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < text.length) parts.push({ type: 'text', text: text.slice(lastIndex) });
    return parts;
  }

  async send() {
    const q = this.query?.trim();
    if (!q) return;
    this.messages.push({ role: 'user', text: q });
    this.query = '';
    const userId = this.auth.currentUser?.uid || null;
    const loadingIdx = this.messages.push({ role: 'assistant', text: 'En cours de recherche...' }) - 1;
    this.saveHistory();
    try {
      const resp = await this.aiChat.ask(userId, q, this.events || []);
      const parts = this.parseAssistantText(resp || '');
      this.messages[loadingIdx] = { role: 'assistant', text: resp || '', parts };
      this.saveHistory();
    } catch (err: any) {
      this.messages[loadingIdx] = { role: 'assistant', text: 'Erreur lors de la requête IA.' };
      this.saveHistory();
      console.error('AI chat error', err);
    }
  }
}
