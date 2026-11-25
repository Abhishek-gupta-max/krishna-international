import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Lightweight animated SVG avatar for the AI assistant (no images or video).
 * Deliberately a friendly robot with an "AI" badge, so it is never mistaken for a real employee.
 * States: idle (blinks), listening (pulsing rings), speaking (mouth moves), thinking (dots).
 */
@Component({
  selector: 'app-ai-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-speaking]': "state() === 'speaking'",
    '[class.is-listening]': "state() === 'listening'",
    '[class.is-thinking]': "state() === 'thinking'",
    '[style.--size.px]': 'size()',
    'aria-hidden': 'true',
  },
  template: `
    <span class="ring ring--1"></span>
    <span class="ring ring--2"></span>
    <svg viewBox="0 0 120 120" class="face">
      <defs>
        <linearGradient id="ai-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1d4374" />
          <stop offset="1" stop-color="#0b2545" />
        </linearGradient>
        <linearGradient id="ai-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="1" stop-color="#e7ecf3" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#ai-bg)" />
      <!-- antenna -->
      <line x1="60" y1="22" x2="60" y2="31" stroke="#d8c4a0" stroke-width="3" stroke-linecap="round" />
      <circle class="antenna" cx="60" cy="19" r="5" fill="#b08d57" />
      <!-- headset band -->
      <path d="M27 62a33 33 0 0 1 66 0" fill="none" stroke="#b08d57" stroke-width="4" stroke-linecap="round" />
      <!-- head -->
      <g class="head">
        <rect x="32" y="31" width="56" height="52" rx="18" fill="url(#ai-head)" />
        <!-- ear pieces -->
        <rect x="24" y="52" width="10" height="20" rx="5" fill="#b08d57" />
        <rect x="86" y="52" width="10" height="20" rx="5" fill="#b08d57" />
        <path d="M91 72c0 9-6 14-15 14" fill="none" stroke="#b08d57" stroke-width="3" stroke-linecap="round" />
        <circle cx="74" cy="86" r="3.5" fill="#d8c4a0" />
        <!-- visor -->
        <rect x="39" y="41" width="42" height="24" rx="11" fill="#0b2545" />
        <g class="eyes">
          <rect x="47" y="48" width="8" height="10" rx="4" fill="#d8c4a0" />
          <rect x="65" y="48" width="8" height="10" rx="4" fill="#d8c4a0" />
        </g>
        <!-- mouth -->
        <rect class="mouth" x="51" y="71" width="18" height="5" rx="2.5" fill="#1d4374" />
      </g>
    </svg>
    <span class="badge">AI</span>
    <span class="dots"><i></i><i></i><i></i></span>
  `,
  styles: `
    :host { position: relative; display: inline-block; flex: none; width: var(--size); height: var(--size); }
    .face { position: relative; z-index: 1; display: block; width: 100%; height: 100%; filter: drop-shadow(0 6px 14px rgba(6,20,39,.25)); }

    /* idle: gentle float + blink */
    .head { transform-origin: 60px 60px; animation: ai-float 4s ease-in-out infinite; }
    .eyes { transform-origin: 60px 53px; animation: ai-blink 5s infinite; }
    .antenna { animation: ai-glow 2.4s ease-in-out infinite; }
    .mouth { transform-origin: 60px 73.5px; transition: transform .15s ease; }

    /* speaking: mouth opens and closes */
    :host(.is-speaking) .mouth { animation: ai-talk .32s ease-in-out infinite alternate; fill: #b08d57; }
    :host(.is-speaking) .antenna { animation-duration: .8s; }

    /* listening: pulsing rings */
    .ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(176,141,87,.6); opacity: 0; pointer-events: none; }
    :host(.is-listening) .ring { animation: ai-ring 1.6s ease-out infinite; }
    :host(.is-listening) .ring--2 { animation-delay: .8s; }
    :host(.is-listening) .eyes rect { fill: #5fd28f; }

    /* thinking: three dots */
    .dots { position: absolute; z-index: 2; left: 50%; bottom: -2px; display: none; gap: 3px; transform: translateX(-50%); padding: 3px 6px; border-radius: 999px; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.15); }
    .dots i { width: 5px; height: 5px; border-radius: 50%; background: #1d4374; animation: ai-dot 1s infinite; }
    .dots i:nth-child(2) { animation-delay: .15s; }
    .dots i:nth-child(3) { animation-delay: .3s; }
    :host(.is-thinking) .dots { display: inline-flex; }

    .badge {
      position: absolute; z-index: 2; right: -2px; top: -2px; padding: 1px 5px; border: 2px solid #fff; border-radius: 999px;
      background: #b08d57; color: #061427; font: 700 calc(var(--size) * .14)/1.2 Inter, system-ui, sans-serif; letter-spacing: .02em;
    }

    @keyframes ai-float { 50% { transform: translateY(-2px); } }
    @keyframes ai-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
    @keyframes ai-glow { 50% { fill: #f5efe4; } }
    @keyframes ai-talk { from { transform: scaleY(1); } to { transform: scaleY(2.6); } }
    @keyframes ai-ring { 0% { transform: scale(1); opacity: .9; } 100% { transform: scale(1.45); opacity: 0; } }
    @keyframes ai-dot { 50% { opacity: .2; transform: translateY(-2px); } }

    @media (prefers-reduced-motion: reduce) {
      .head, .eyes, .antenna, .mouth, .ring, .dots i { animation: none !important; }
      :host(.is-listening) .ring { opacity: .8; }
    }
  `,
})
export class AiAvatarComponent {
  readonly state = input<'idle' | 'listening' | 'speaking' | 'thinking'>('idle');
  readonly size = input(48);
}
