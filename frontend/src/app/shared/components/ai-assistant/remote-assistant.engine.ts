import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AssistantEngine, AssistantReply, AssistantRequest } from './assistant.models';
import { WebsiteKnowledgeEngine } from './website-knowledge.engine';

/**
 * Optional connector for a real language model, for later use.
 *
 * Set `assistantEndpoint` in the environment files to a URL on YOUR backend (for example a
 * route that forwards to a free self-hosted model such as Ollama). The browser never talks to
 * a model provider directly, so no API keys ever reach the frontend.
 *
 * Expected contract:  POST { message, lang, history }  →  { reply: string, actions?: AssistantAction[] }
 * If the endpoint is missing or fails, the free on-device WebsiteKnowledgeEngine answers instead.
 */
@Injectable({ providedIn: 'root' })
export class RemoteAssistantEngine implements AssistantEngine {
  private readonly http = inject(HttpClient);
  private readonly fallback = inject(WebsiteKnowledgeEngine);
  private readonly endpoint = (environment as { assistantEndpoint?: string }).assistantEndpoint || '';

  get modeLabel(): string {
    return this.endpoint ? 'AI model · verify important details with our team' : this.fallback.modeLabel;
  }

  async reply(request: AssistantRequest): Promise<AssistantReply> {
    if (!this.endpoint) return this.fallback.reply(request);
    try {
      const res = await firstValueFrom(
        this.http.post<{ reply: string; actions?: AssistantReply['actions'] }>(this.endpoint, request).pipe(timeout(20000))
      );
      if (!res?.reply) throw new Error('Empty reply');
      return { text: res.reply, actions: res.actions };
    } catch {
      return this.fallback.reply(request);
    }
  }
}
