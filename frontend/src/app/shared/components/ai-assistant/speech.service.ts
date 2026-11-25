import { Injectable, NgZone, inject, signal } from '@angular/core';
import { AssistantLang } from './assistant.models';

/* Minimal typings for the Web Speech API (not in the default TS DOM lib). */
interface SpeechRecognitionResultLike { isFinal: boolean; 0: { transcript: string } }
interface SpeechRecognitionEventLike { resultIndex: number; results: ArrayLike<SpeechRecognitionResultLike> }
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => SpeechRecognitionLike;

const LOCALES: Record<AssistantLang, string> = { en: 'en-IN', hi: 'hi-IN' };

/**
 * Browser voice features only (free, no external service):
 * SpeechRecognition for the microphone, speechSynthesis for spoken replies.
 * The microphone is started only when the visitor presses the mic button.
 */
@Injectable({ providedIn: 'root' })
export class SpeechService {
  private readonly zone = inject(NgZone);
  private readonly Recognition: RecognitionCtor | null =
    typeof window !== 'undefined'
      ? ((window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }).SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: RecognitionCtor }).webkitSpeechRecognition ??
        null)
      : null;

  readonly canListen = !!this.Recognition;
  readonly canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  readonly listening = signal(false);
  readonly speaking = signal(false);
  readonly interim = signal('');

  private recognition: SpeechRecognitionLike | null = null;

  /** Starts listening; resolves with the final transcript ('' if nothing was heard). Rejects with a visitor-friendly message. */
  listen(lang: AssistantLang): Promise<string> {
    if (!this.Recognition) {
      return Promise.reject(new Error('unsupported'));
    }
    this.stopSpeaking();
    this.abortListening();

    return new Promise<string>((resolve, reject) => {
      const rec = new this.Recognition!();
      this.recognition = rec;
      rec.lang = LOCALES[lang];
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;
      let finalText = '';
      let failed = false;

      rec.onresult = (e) =>
        this.zone.run(() => {
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i];
            if (r.isFinal) finalText += r[0].transcript;
            else interim += r[0].transcript;
          }
          this.interim.set((finalText + ' ' + interim).trim());
        });
      rec.onerror = (e) =>
        this.zone.run(() => {
          failed = true;
          this.listening.set(false);
          this.interim.set('');
          reject(new Error(e.error || 'error'));
        });
      rec.onend = () =>
        this.zone.run(() => {
          this.listening.set(false);
          this.interim.set('');
          this.recognition = null;
          if (!failed) resolve(finalText.trim());
        });

      try {
        rec.start();
        this.listening.set(true);
      } catch {
        this.listening.set(false);
        reject(new Error('start-failed'));
      }
    });
  }

  /** Stop listening and use what was heard so far. */
  stopListening(): void {
    this.recognition?.stop();
  }

  abortListening(): void {
    this.recognition?.abort();
    this.recognition = null;
    this.listening.set(false);
    this.interim.set('');
  }

  speak(text: string, lang: AssistantLang): void {
    if (!this.canSpeak) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LOCALES[lang];
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang === LOCALES[lang]) ??
      voices.find((v) => v.lang.toLowerCase().startsWith(lang)) ??
      (lang === 'en' ? voices.find((v) => v.lang.startsWith('en')) : undefined);
    if (voice) utter.voice = voice;
    utter.rate = 1;
    utter.pitch = 1;
    utter.onstart = () => this.zone.run(() => this.speaking.set(true));
    utter.onend = () => this.zone.run(() => this.speaking.set(false));
    utter.onerror = () => this.zone.run(() => this.speaking.set(false));
    synth.speak(utter);
  }

  stopSpeaking(): void {
    if (this.canSpeak) window.speechSynthesis.cancel();
    this.speaking.set(false);
  }

  /** Maps recognition error codes to messages for the visitor. */
  errorMessage(code: string, lang: AssistantLang): string {
    const hi = lang === 'hi';
    switch (code) {
      case 'unsupported':
        return hi
          ? 'आपका ब्राउज़र वॉइस इनपुट सपोर्ट नहीं करता। कृपया नीचे टाइप करें, या Chrome/Edge का उपयोग करें।'
          : 'Voice input isn’t supported in this browser. Please type your question below, or use Chrome or Edge.';
      case 'not-allowed':
      case 'service-not-allowed':
        return hi
          ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र के एड्रेस बार में माइक आइकन से अनुमति दें, या टाइप करें।'
          : 'Microphone permission was blocked. Allow the microphone from your browser’s address bar, or type your question instead.';
      case 'no-speech':
        return hi ? 'कोई आवाज़ नहीं सुनाई दी। फिर से कोशिश करें।' : 'I didn’t hear anything. Please try again.';
      case 'audio-capture':
        return hi ? 'कोई माइक्रोफ़ोन नहीं मिला।' : 'No microphone was found on this device.';
      case 'network':
        return hi ? 'वॉइस पहचान के लिए इंटरनेट कनेक्शन चाहिए। कृपया टाइप करें।' : 'Voice recognition needs an internet connection. Please type instead.';
      default:
        return hi ? 'वॉइस इनपुट में समस्या आई। कृपया टाइप करें।' : 'Something went wrong with voice input. Please type your question.';
    }
  }
}
