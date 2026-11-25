import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { AiAvatarComponent } from './ai-avatar.component';
import { AssistantAction, AssistantLang, ChatMessage } from './assistant.models';
import { RemoteAssistantEngine } from './remote-assistant.engine';
import { SpeechService } from './speech.service';

const STORAGE_KEY = 'ki-assistant-prefs';

const SUGGESTIONS: Record<AssistantLang, string[]> = {
  en: ['I want to hire workers', 'How do I register for a job?', 'Which documents do I need?', 'Are there any vacancies?', 'Is your company MEA approved?', 'Contact details'],
  hi: ['मुझे कर्मचारी चाहिए', 'नौकरी के लिए रजिस्टर कैसे करें?', 'कौन से दस्तावेज़ चाहिए?', 'क्या अभी वैकेंसी है?', 'क्या आप MEA से मान्यता प्राप्त हैं?', 'संपर्क नंबर'],
};

const WELCOME: Record<AssistantLang, string> = {
  en: 'Hello! I’m the Krishna International AI Consultant — an automated assistant, not a person. I can explain our manpower recruitment services, help employers share a requirement and guide candidates through registration. Type or tap the mic to ask.',
  hi: 'नमस्ते! मैं कृष्णा इंटरनेशनल का AI सलाहकार हूं — एक स्वचालित सहायक, कोई व्यक्ति नहीं। मैं हमारी मैनपावर भर्ती सेवाएं समझा सकता हूं, नियोक्ताओं की आवश्यकता भेजने में और उम्मीदवारों को पंजीकरण में मदद कर सकता हूं। टाइप करें या माइक दबाकर पूछें।',
};

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [FormsModule, IconComponent, AiAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss',
})
export class AiAssistantComponent {
  private readonly engine = inject(RemoteAssistantEngine);
  private readonly router = inject(Router);
  protected readonly speech = inject(SpeechService);

  private readonly log = viewChild<ElementRef<HTMLElement>>('log');
  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly launcher = viewChild<ElementRef<HTMLButtonElement>>('launcher');

  protected readonly open = signal(false);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly busy = signal(false);
  protected readonly notice = signal('');
  protected readonly lang = signal<AssistantLang>('en');
  protected readonly muted = signal(false);
  protected readonly unread = signal(false);
  protected draft = '';

  protected readonly modeLabel = this.engine.modeLabel;
  protected readonly suggestions = computed(() => SUGGESTIONS[this.lang()]);
  protected readonly welcome = computed(() => WELCOME[this.lang()]);
  protected readonly avatarState = computed(() =>
    this.speech.listening() ? 'listening' : this.speech.speaking() ? 'speaking' : this.busy() ? 'thinking' : 'idle'
  );

  private nextId = 1;

  constructor() {
    try {
      const prefs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (prefs.lang === 'hi' || prefs.lang === 'en') this.lang.set(prefs.lang);
      if (typeof prefs.muted === 'boolean') this.muted.set(prefs.muted);
    } catch {
      /* storage unavailable — defaults are fine */
    }
    inject(DestroyRef).onDestroy(() => {
      this.speech.abortListening();
      this.speech.stopSpeaking();
    });
  }

  // ---------------------------------------------------------------------------
  // Window controls
  // ---------------------------------------------------------------------------

  protected toggle(): void {
    if (this.open()) this.minimize();
    else this.show();
  }

  protected show(): void {
    this.open.set(true);
    this.unread.set(false);
    setTimeout(() => {
      this.inputEl()?.nativeElement.focus();
      this.scrollToEnd();
    });
  }

  /** Hide the window but keep the conversation. */
  protected minimize(): void {
    this.speech.abortListening();
    this.speech.stopSpeaking();
    this.open.set(false);
    setTimeout(() => this.launcher()?.nativeElement.focus());
  }

  /** Close: stop voice and end the conversation. */
  protected close(): void {
    this.minimize();
    this.resetConversation();
  }

  protected clear(): void {
    this.speech.stopSpeaking();
    this.resetConversation();
    this.inputEl()?.nativeElement.focus();
  }

  private resetConversation(): void {
    this.messages.set([]);
    this.notice.set('');
    this.draft = '';
    this.unread.set(false);
  }

  protected setLang(l: AssistantLang): void {
    if (this.lang() === l) return;
    this.lang.set(l);
    this.speech.stopSpeaking();
    this.savePrefs();
  }

  protected toggleMute(): void {
    this.muted.update((m) => !m);
    if (this.muted()) this.speech.stopSpeaking();
    this.savePrefs();
  }

  private savePrefs(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang: this.lang(), muted: this.muted() }));
    } catch {
      /* ignore */
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.minimize();
  }

  // ---------------------------------------------------------------------------
  // Conversation
  // ---------------------------------------------------------------------------

  protected send(text = this.draft): void {
    const message = text.trim();
    if (!message || this.busy()) return;
    this.draft = '';
    this.notice.set('');
    const lang = /[ऀ-ॿ]/.test(message) ? 'hi' : this.lang();
    this.push({ role: 'user', text: message, lang });
    this.busy.set(true);

    const history = this.messages().slice(-8).map(({ role, text: t }) => ({ role, text: t }));
    // Small delay so the "thinking" state is visible and replies don't feel abrupt.
    const started = performance.now();
    this.engine
      .reply({ message, lang, history })
      .then(async (reply) => {
        const wait = Math.max(0, 450 - (performance.now() - started));
        if (wait) await new Promise((r) => setTimeout(r, wait));
        this.push({ role: 'assistant', text: reply.text, lang, actions: reply.actions });
        if (!this.muted() && this.open()) this.speech.speak(reply.text, lang);
        if (!this.open()) this.unread.set(true);
      })
      .catch(() => {
        this.push({
          role: 'assistant',
          lang,
          text: lang === 'hi' ? 'माफ़ कीजिए, कुछ गड़बड़ हुई। कृपया फिर से कोशिश करें या हमें कॉल करें।' : 'Sorry, something went wrong. Please try again or call us.',
        });
      })
      .finally(() => this.busy.set(false));
  }

  protected async toggleMic(): Promise<void> {
    if (this.speech.listening()) {
      this.speech.stopListening();
      return;
    }
    this.notice.set('');
    try {
      const heard = await this.speech.listen(this.lang());
      if (heard) this.send(heard);
      else this.notice.set(this.speech.errorMessage('no-speech', this.lang()));
    } catch (e) {
      const code = (e as Error).message;
      if (code !== 'aborted') this.notice.set(this.speech.errorMessage(code, this.lang()));
    }
  }

  protected stopSpeaking(): void {
    this.speech.stopSpeaking();
  }

  protected runAction(action: AssistantAction, event: Event): void {
    if (!action.route) return; // external links (tel:, wa.me, PDF) use the normal <a href>
    event.preventDefault();
    this.speech.stopSpeaking();
    this.router.navigate([action.route], action.fragment ? { fragment: action.fragment } : {});
    // On small screens get out of the way so the visitor can see the page/form.
    if (window.matchMedia('(max-width: 639.98px)').matches) this.minimize();
  }

  private push(msg: Omit<ChatMessage, 'id'>): void {
    this.messages.update((list) => [...list, { ...msg, id: this.nextId++ }]);
    setTimeout(() => this.scrollToEnd());
  }

  private scrollToEnd(): void {
    const el = this.log()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
