import { InjectionToken } from '@angular/core';

export type AssistantLang = 'en' | 'hi';

/** A follow-up the visitor can take: an internal route or an external link (tel:, mailto:, wa.me, PDF). */
export interface AssistantAction {
  label: string;
  route?: string;
  fragment?: string;
  href?: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  lang: AssistantLang;
  actions?: AssistantAction[];
  /** Marks system notices (privacy, browser support) so they can be styled differently. */
  notice?: boolean;
}

export interface AssistantReply {
  text: string;
  actions?: AssistantAction[];
}

export interface AssistantRequest {
  message: string;
  lang: AssistantLang;
  history: Pick<ChatMessage, 'role' | 'text'>[];
}

/**
 * Anything that can answer the visitor. The default is the free, on-device
 * WebsiteKnowledgeEngine (demo mode). A real model can be plugged in later by
 * providing a different engine (see RemoteAssistantEngine) — the UI does not change.
 */
export interface AssistantEngine {
  /** Shown in the header so visitors know what is answering them. */
  readonly modeLabel: string;
  reply(request: AssistantRequest): Promise<AssistantReply>;
}

export const ASSISTANT_ENGINE = new InjectionToken<AssistantEngine>('ASSISTANT_ENGINE');
