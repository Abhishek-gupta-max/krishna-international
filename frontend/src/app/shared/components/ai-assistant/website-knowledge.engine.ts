import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  DESTINATION_COUNTRIES,
  JOB_CATEGORIES,
  PROCESS_STEPS,
  SECTORS,
  SERVICES,
  WHY_CHOOSE_US,
} from '../../../core/models/reference-data';
import { PublicApiService } from '../../../core/services/public-api.service';
import { SettingsService } from '../../../core/services/settings.service';
import { AssistantAction, AssistantEngine, AssistantLang, AssistantReply, AssistantRequest } from './assistant.models';

/**
 * DEMO MODE engine — free and fully on-device.
 *
 * It is NOT a language model. It recognises what the visitor is asking about (English, Hindi
 * or Hinglish keywords), then builds the answer from this website's own data: the services,
 * sectors and process in reference-data.ts, the company settings from the API (phones,
 * address, MEA registration) and the live list of published vacancies. It never invents
 * vacancies, salaries, fees or guarantees; when the site has no answer it says so and points
 * to the recruitment team.
 */

type IntentId =
  | 'greeting' | 'thanks' | 'hire' | 'employerInfo' | 'register' | 'documents' | 'jobs' | 'services'
  | 'sectors' | 'trades' | 'process' | 'contact' | 'whatsapp' | 'licence' | 'fees' | 'salary'
  | 'countries' | 'about' | 'eligibility' | 'safety' | 'status';

interface Intent {
  id: IntentId;
  /** Single words or short phrases. Phrases (with a space) score double. */
  keys: string[];
}

const INTENTS: Intent[] = [
  { id: 'greeting', keys: ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'good morning', 'good evening', 'नमस्ते', 'नमस्कार', 'हेलो', 'हाय'] },
  { id: 'thanks', keys: ['thanks', 'thank you', 'thank', 'dhanyavad', 'shukriya', 'ok bye', 'bye', 'धन्यवाद', 'शुक्रिया'] },
  {
    id: 'hire',
    keys: ['hire', 'hiring', 'manpower', 'workers', 'worker chahiye', 'employer', 'requirement', 'recruit for', 'need staff', 'need workers',
      'labour', 'labor', 'bulk', 'staff', 'enquiry', 'inquiry', 'company', 'chahiye worker', 'majdoor', 'मजदूर', 'कर्मचारी चाहिए', 'भर्ती करनी', 'नियोक्ता', 'मैनपावर', 'वर्कर'],
  },
  {
    id: 'employerInfo',
    keys: ['what information', 'what details', 'details required', 'information required', 'form fields', 'what to fill', 'which details', 'kya bharna', 'क्या जानकारी', 'कौन सी जानकारी', 'फॉर्म में क्या'],
  },
  {
    id: 'register',
    keys: ['register', 'registration', 'apply', 'application', 'sign up', 'cv', 'resume', 'biodata', 'candidate', 'job seeker', 'kaise apply',
      'naukri chahiye', 'job chahiye', 'kaam chahiye', 'रजिस्टर', 'रजिस्ट्रेशन', 'पंजीकरण', 'आवेदन', 'अप्लाई', 'बायोडाटा', 'नौकरी चाहिए', 'काम चाहिए'],
  },
  {
    id: 'documents',
    keys: ['document', 'documents', 'papers', 'passport', 'certificate', 'certificates', 'photo', 'photographs', 'kagaz', 'kagzat', 'dastavej',
      'दस्तावेज', 'कागज', 'कागजात', 'पासपोर्ट', 'प्रमाणपत्र', 'फोटो'],
  },
  {
    id: 'jobs',
    keys: ['job', 'jobs', 'vacancy', 'vacancies', 'opening', 'openings', 'opportunity', 'opportunities', 'naukri', 'kaam', 'position', 'positions',
      'नौकरी', 'नौकरियां', 'वैकेंसी', 'रिक्ति', 'रिक्तियां', 'काम', 'जॉब'],
  },
  { id: 'services', keys: ['service', 'services', 'what do you do', 'offer', 'provide', 'kya karte', 'सेवा', 'सेवाएं', 'सर्विस', 'क्या करते'] },
  { id: 'sectors', keys: ['sector', 'sectors', 'industry', 'industries', 'field', 'fields', 'क्षेत्र', 'उद्योग', 'सेक्टर'] },
  {
    id: 'trades',
    keys: ['trade', 'trades', 'category', 'categories', 'roles', 'electrician', 'plumber', 'welder', 'driver', 'mason', 'carpenter', 'cook', 'helper',
      'security guard', 'nurse', 'caregiver', 'technician', 'ट्रेड', 'इलेक्ट्रीशियन', 'प्लंबर', 'वेल्डर', 'ड्राइवर', 'मिस्त्री', 'हेल्पर'],
  },
  { id: 'process', keys: ['process', 'procedure', 'steps', 'how does it work', 'how it works', 'kaise hota', 'प्रक्रिया', 'कैसे होता', 'चरण'] },
  {
    id: 'contact',
    keys: ['contact', 'phone', 'call', 'number', 'mobile', 'email', 'address', 'office', 'location', 'where', 'visit', 'timing', 'hours', 'sampark',
      'संपर्क', 'फोन', 'नंबर', 'पता', 'ऑफिस', 'कार्यालय', 'कहां', 'ईमेल'],
  },
  { id: 'whatsapp', keys: ['whatsapp', 'whats app', 'व्हाट्सएप', 'वॉट्सऐप'] },
  {
    id: 'licence',
    keys: ['licence', 'license', 'mea', 'registered', 'registration number', 'rc', 'rc number', 'approved', 'genuine', 'legal', 'government', 'certificate number',
      'emigrate', 'लाइसेंस', 'मान्यता', 'रजिस्टर्ड', 'सरकार', 'असली'],
  },
  { id: 'fees', keys: ['fee', 'fees', 'charge', 'charges', 'cost', 'payment', 'pay', 'money', 'paisa', 'paise', 'kharcha', 'फीस', 'शुल्क', 'पैसे', 'पैसा', 'खर्च', 'भुगतान'] },
  { id: 'salary', keys: ['salary', 'salaries', 'pay scale', 'wages', 'income', 'kitna milega', 'tankhwah', 'वेतन', 'सैलरी', 'तनख्वाह', 'कितना मिलेगा'] },
  { id: 'countries', keys: ['country', 'countries', 'dubai', 'uae', 'saudi', 'qatar', 'kuwait', 'oman', 'bahrain', 'gulf', 'abroad', 'overseas', 'videsh', 'bahar', 'देश', 'विदेश', 'दुबई', 'सऊदी', 'कतर', 'खाड़ी'] },
  { id: 'about', keys: ['about', 'who are you', 'company', 'why choose', 'trust', 'experience of company', 'kaun', 'कंपनी', 'आप कौन', 'आपके बारे'] },
  { id: 'eligibility', keys: ['eligible', 'eligibility', 'age', 'qualification', 'education', 'experience required', 'fresher', 'योग्यता', 'उम्र', 'आयु', 'पढ़ाई', 'फ्रेशर'] },
  { id: 'safety', keys: ['fraud', 'fake', 'scam', 'cheat', 'safe', 'dhokha', 'धोखा', 'फर्जी', 'ठगी'] },
  { id: 'status', keys: ['status', 'my application', 'when will', 'kab tak', 'selected', 'result', 'स्थिति', 'कब तक', 'चयन'] },
];

const PHONE_OR_EMAIL = /(\+?\d[\d\s-]{8,}\d)|([^\s@]+@[^\s@]+\.[^\s@]+)/;

@Injectable({ providedIn: 'root' })
export class WebsiteKnowledgeEngine implements AssistantEngine {
  readonly modeLabel = 'Demo mode · answers from this website';

  private readonly site = inject(SettingsService);
  private readonly api = inject(PublicApiService);

  async reply({ message, lang }: AssistantRequest): Promise<AssistantReply> {
    const text = message.trim();
    const q = this.normalise(text);
    const replyLang: AssistantLang = /[ऀ-ॿ]/.test(text) ? 'hi' : lang;

    const privacy = PHONE_OR_EMAIL.test(text)
      ? replyLang === 'hi'
        ? 'कृपया अपना फ़ोन नंबर या ईमेल यहां चैट में साझा न करें — इसके लिए नीचे दिए गए फ़ॉर्म का उपयोग करें। '
        : 'Please don’t share your phone number or email in this chat — use the form instead. '
      : '';

    // A specific service named in the question gets a detailed answer.
    const service = this.matchService(q);
    const intent = this.detectIntent(q);
    let answer: AssistantReply;

    if (service && (!intent || intent === 'services' || intent === 'hire')) {
      answer = this.serviceAnswer(service, replyLang);
    } else if (intent) {
      answer = await this.answer(intent, replyLang);
    } else {
      answer = this.fallback(replyLang);
    }
    return { ...answer, text: privacy + answer.text };
  }

  // ---------------------------------------------------------------------------
  // Intent detection
  // ---------------------------------------------------------------------------

  private normalise(s: string): string {
    // Keep letters, combining marks (Hindi matras) and digits; everything else becomes a space.
    return ` ${s.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()} `;
  }

  private detectIntent(q: string): IntentId | null {
    let best: IntentId | null = null;
    let bestScore = 0;
    for (const intent of INTENTS) {
      let score = 0;
      for (const key of intent.keys) {
        if (q.includes(` ${key} `) || (/[ऀ-ॿ]/.test(key) && q.includes(key))) score += key.includes(' ') ? 2 : 1;
      }
      // Specific questions win over generic ones when tied.
      if (score > bestScore || (score === bestScore && score > 0 && this.priority(intent.id) > this.priority(best!))) {
        best = intent.id;
        bestScore = score;
      }
    }
    return bestScore > 0 ? best : null;
  }

  private priority(id: IntentId): number {
    const order: IntentId[] = ['employerInfo', 'documents', 'licence', 'fees', 'salary', 'safety', 'status', 'eligibility', 'whatsapp', 'register', 'hire', 'jobs', 'process', 'countries', 'trades', 'sectors', 'services', 'contact', 'about', 'thanks', 'greeting'];
    const i = order.indexOf(id);
    return i < 0 ? 0 : order.length - i;
  }

  private matchService(q: string) {
    let best: (typeof SERVICES)[number] | null = null;
    let bestHits = 0;
    for (const svc of SERVICES) {
      const words = svc.title.toLowerCase().split(/\s+/).filter((w) => w.length > 4 && !['recruitment', 'manpower', 'support'].includes(w));
      const hits = words.filter((w) => q.includes(` ${w}`)).length;
      if (hits > bestHits) {
        best = svc;
        bestHits = hits;
      }
    }
    return bestHits > 0 ? best : null;
  }

  // ---------------------------------------------------------------------------
  // Answers (built from website data)
  // ---------------------------------------------------------------------------

  private actions = {
    employer: (l: AssistantLang): AssistantAction => ({ label: l === 'hi' ? 'नियोक्ता पूछताछ फ़ॉर्म खोलें' : 'Open employer enquiry form', route: '/employers' }),
    candidate: (l: AssistantLang): AssistantAction => ({ label: l === 'hi' ? 'उम्मीदवार पंजीकरण फ़ॉर्म खोलें' : 'Open candidate registration', route: '/candidates' }),
    services: (l: AssistantLang): AssistantAction => ({ label: l === 'hi' ? 'हमारी सेवाएं देखें' : 'View our services', route: '/services' }),
    contact: (l: AssistantLang): AssistantAction => ({ label: l === 'hi' ? 'संपर्क पेज' : 'Contact page', route: '/contact' }),
    call: (l: AssistantLang): AssistantAction => ({ label: (l === 'hi' ? 'कॉल करें ' : 'Call ') + this.site.settings().phone_primary, href: this.site.phoneHref() }),
    whatsapp: (l: AssistantLang): AssistantAction => ({ label: l === 'hi' ? 'व्हाट्सएप पर बात करें' : 'Chat on WhatsApp', href: this.site.whatsappLink('general') }),
  };

  private async answer(id: IntentId, l: AssistantLang): Promise<AssistantReply> {
    const s = this.site.settings();
    const a = this.actions;
    const hi = l === 'hi';

    switch (id) {
      case 'greeting':
        return {
          text: hi
            ? `नमस्ते! मैं ${s.company_name} का AI सहायक हूं (डेमो मोड)। मैं नियोक्ताओं को मैनपावर भर्ती में और उम्मीदवारों को पंजीकरण में मदद कर सकता हूं। आप क्या जानना चाहते हैं?`
            : `Hello! I’m the AI assistant for ${s.company_name} (demo mode). I can help employers with manpower recruitment and candidates with registration. What would you like to know?`,
          actions: [a.employer(l), a.candidate(l)],
        };

      case 'thanks':
        return { text: hi ? 'धन्यवाद! और कुछ पूछना हो तो बताइए।' : 'You’re welcome! Ask me anything else about our recruitment services.' };

      case 'hire':
        return {
          text: hi
            ? 'मैनपावर की भर्ती के लिए नियोक्ता पूछताछ फ़ॉर्म भरें — पद, संख्या, अनुभव और शर्तें बताएं। हमारी टीम सोर्सिंग योजना और समय-सीमा के साथ आपसे संपर्क करेगी। हम कुशल, अर्ध-कुशल और अकुशल श्रमिकों की भर्ती करते हैं।'
            : 'To hire manpower, fill in the employer enquiry form with the positions, numbers, experience and terms. Our team will come back to you with a sourcing plan and timeline. We recruit skilled, semi-skilled and unskilled workers, with screened profiles, arranged interviews and one point of contact from start to joining.',
          actions: [a.employer(l), a.services(l), a.call(l)],
        };

      case 'employerInfo':
        return {
          text: hi
            ? 'नियोक्ता फ़ॉर्म में ये जानकारी मांगी जाती है: कंपनी का नाम, संपर्क व्यक्ति, व्यावसायिक ईमेल, फ़ोन/व्हाट्सएप, देश, उद्योग, मैनपावर आवश्यकताएं (पद, प्रति पद संख्या, अनुभव, वेतन सीमा और अनुबंध शर्तें), कुल आवश्यक कर्मचारी, और वैकल्पिक संदेश। आवास, भोजन, परिवहन और इंटरव्यू की तारीखें भी बताना उपयोगी है।'
            : 'The employer enquiry form asks for: company name, contact person, business email, phone/WhatsApp, country, industry, manpower requirements (positions, number per position, experience, salary range and contract terms), the total number of employees required, and an optional message. It also helps to mention accommodation, food and transport terms, and preferred interview dates.',
          actions: [a.employer(l)],
        };

      case 'register':
        return {
          text: hi
            ? 'उम्मीदवार पंजीकरण फ़ॉर्म में अपना नाम, मोबाइल, ईमेल, योग्यता, अनुभव (वर्ष), पसंदीदा देश और नौकरी श्रेणी भरें। आप अपना CV (PDF, DOC या DOCX, 5 MB तक) भी अपलोड कर सकते हैं। जब कोई उपयुक्त वैकेंसी होगी, हमारी टीम आपसे संपर्क करेगी।'
            : 'Register once using the candidate form: name, mobile, email, highest qualification, years of experience, preferred country and job category. You can also upload your CV (PDF, DOC or DOCX, up to 5 MB) and say whether you have a passport. Our team contacts you when a vacancy matches your trade and experience.',
          actions: [a.candidate(l)],
        };

      case 'documents':
        return {
          text: hi
            ? 'ये दस्तावेज़ तैयार रखें: पासपोर्ट (आमतौर पर कम से कम 6 महीने वैध), शैक्षिक और ट्रेड प्रमाणपत्र, पिछले नियोक्ताओं के अनुभव पत्र, हाल की पासपोर्ट-साइज़ फोटो, और संपर्क नंबर के साथ अपडेटेड CV। किसी नौकरी के लिए अतिरिक्त दस्तावेज़ हमारी टीम बताएगी।'
            : 'Keep these documents ready: passport (commonly valid for at least 6 months), educational and trade certificates, experience letters from previous employers, recent passport-size photographs, and an updated CV with your contact number. Our team will tell you if a particular job needs anything else.',
          actions: [a.candidate(l)],
        };

      case 'jobs':
        return this.jobsAnswer(l);

      case 'services':
        return {
          text: (hi ? 'हमारी भर्ती सेवाएं: ' : 'Our recruitment services: ') + SERVICES.map((x) => x.title).join(', ') + (hi ? '। किसी सेवा के बारे में विस्तार से पूछें।' : '. Ask me about any one of them for details.'),
          actions: [a.services(l), a.employer(l)],
        };

      case 'sectors':
        return {
          text: (hi ? 'हम इन उद्योग क्षेत्रों के लिए भर्ती करते हैं: ' : 'We recruit for these industry sectors: ') + SECTORS.map((x) => x.name).join(', ') + '.',
          actions: [a.services(l)],
        };

      case 'trades':
        return {
          text:
            (hi ? 'पंजीकरण फ़ॉर्म में ये नौकरी श्रेणियां हैं: ' : 'The registration form covers these job categories: ') +
            JOB_CATEGORIES.filter((c) => c !== 'Other').join(', ') +
            (hi ? '। किसी विशेष ट्रेड की वैकेंसी हमारी टीम कन्फर्म करेगी।' : '. Our team confirms current openings for any specific trade.'),
          actions: [a.candidate(l)],
        };

      case 'process':
        return {
          text: (hi ? 'हमारी भर्ती प्रक्रिया: ' : 'Our recruitment process: ') + PROCESS_STEPS.map((p, i) => `${i + 1}. ${p.title} — ${p.text}`).join(' '),
          actions: [a.employer(l), a.candidate(l)],
        };

      case 'contact': {
        const phones = [s.phone_primary, s.phone_alternate].filter(Boolean).join(hi ? ' या ' : ' or ');
        return {
          text: hi
            ? `हमें ${phones} पर कॉल करें, ${s.email} पर ईमेल करें, या हमारे कार्यालय आएं: ${s.address}। संपर्क व्यक्ति: ${s.contact_person}।${s.office_hours ? ` कार्यालय समय: ${s.office_hours}।` : ''}`
            : `Call us on ${phones}, email ${s.email}, or visit our office: ${s.address}. Contact person: ${s.contact_person}.${s.office_hours ? ` Office hours: ${s.office_hours}.` : ''}`,
          actions: [a.call(l), a.whatsapp(l), a.contact(l)],
        };
      }

      case 'whatsapp':
        return {
          text: (hi ? 'आप हमें व्हाट्सएप पर इन नंबरों पर संदेश भेज सकते हैं: ' : 'You can message us on WhatsApp: ') + this.site.whatsappNumbers().map((w) => w.label).join(', ') + '.',
          actions: [a.whatsapp(l)],
        };

      case 'licence':
        return s.mea_rc_number
          ? {
              text: hi
                ? `हम विदेश मंत्रालय (MEA), भारत सरकार द्वारा उत्प्रवास अधिनियम, 1983 के तहत पंजीकृत भर्ती एजेंट हैं। RC नंबर: ${s.mea_rc_number}। आप इसे eMigrate पोर्टल पर जांच सकते हैं।`
                : `We are a Recruiting Agent registered with the Ministry of External Affairs (MEA), Government of India, under the Emigration Act, 1983. RC No. ${s.mea_rc_number}. You can verify it on the eMigrate portal.`,
              actions: [
                ...(s.mea_rc_document_url ? [{ label: hi ? 'प्रमाणपत्र देखें' : 'View certificate', href: s.mea_rc_document_url }] : []),
                { label: hi ? 'eMigrate पोर्टल' : 'eMigrate portal', href: 'https://emigrate.gov.in' },
              ],
            }
          : {
              text: hi
                ? `हमारा व्यवसाय उत्तर प्रदेश में पंजीकृत है (Reg. No. ${s.registration_number})।`
                : `Our business is registered in Uttar Pradesh (Reg. No. ${s.registration_number}).`,
              actions: [{ label: hi ? 'पंजीकरण विवरण' : 'Registration details', route: '/about' }],
            };

      case 'fees':
        return {
          text: hi
            ? 'शुल्क की जानकारी इस वेबसाइट पर प्रकाशित नहीं है, इसलिए मैं कोई राशि नहीं बता सकता। कृपया हमारी टीम से पुष्टि करें। किसी भी भुगतान के लिए हमारे कार्यालय से लिखित रसीद अवश्य लें।'
            : 'Charges are not published on this website, so I can’t quote any amount. Please confirm with our team directly — and always ask for a written receipt from our office for any payment.',
          actions: [a.call(l), a.contact(l)],
        };

      case 'salary':
        return {
          text: hi
            ? 'वेतन हर नौकरी और नियोक्ता पर निर्भर करता है। मैं कोई अनुमान नहीं दूंगा — प्रकाशित वैकेंसी में दी गई जानकारी या हमारी टीम द्वारा बताई गई शर्तें ही मान्य हैं।'
            : 'Salary depends on each job and employer, so I won’t guess. Only the details in a published vacancy, or the terms our team confirms with you, are reliable.',
          actions: [a.candidate(l), a.call(l)],
        };

      case 'countries':
        return {
          text: hi
            ? `पंजीकरण फ़ॉर्म में आप पसंदीदा देश चुन सकते हैं, जैसे ${DESTINATION_COUNTRIES.filter((c) => c !== 'Other').slice(0, 6).join(', ')} आदि। किसी देश में अभी वैकेंसी है या नहीं, यह हमारी टीम कन्फर्म करेगी।`
            : `In the registration form you can choose a preferred country such as ${DESTINATION_COUNTRIES.filter((c) => c !== 'Other').slice(0, 6).join(', ')} and others. Whether a country has openings right now is confirmed by our team.`,
          actions: [a.candidate(l), a.call(l)],
        };

      case 'about':
        return {
          text: hi
            ? `${s.company_name} गोरखपुर, उत्तर प्रदेश स्थित मैनपावर भर्ती फर्म है। हम आवश्यकता पहले समझते हैं, प्रोफ़ाइल की जांच करते हैं, साफ़ जानकारी देते हैं और शुरू से जॉइनिंग तक एक ही संपर्क व्यक्ति रखते हैं।`
            : `${s.about_summary} Why choose us: ${WHY_CHOOSE_US.map((w) => w.title.toLowerCase()).join(', ')}.`,
          actions: [{ label: hi ? 'हमारे बारे में' : 'About us', route: '/about' }],
        };

      case 'eligibility':
        return {
          text: hi
            ? 'योग्यता हर नौकरी के अनुसार अलग होती है। पंजीकरण के लिए अपनी योग्यता (10वीं से नीचे से लेकर स्नातकोत्तर, ITI, डिप्लोमा आदि) और अनुभव भरें — फ्रेशर भी 0 वर्ष अनुभव के साथ पंजीकरण कर सकते हैं। उम्र या अन्य शर्तें नियोक्ता तय करता है; हमारी टीम बताएगी।'
            : 'Eligibility depends on each job. To register you enter your highest qualification (from below 10th up to post-graduate, ITI, diploma, nursing and more) and your experience in years — freshers can enter 0. Age and other conditions are set by the employer for each vacancy, and our team will confirm them.',
          actions: [a.candidate(l)],
        };

      case 'safety':
        return {
          text: hi
            ? `सुरक्षित रहें: हमारे नाम से आए किसी भी नौकरी प्रस्ताव की पुष्टि ${s.phone_primary} पर कॉल करके करें। अपना मूल पासपोर्ट किसी को न दें और बिना लिखित रसीद के किसी को पैसे न दें।`
            : `Stay safe: confirm any job offer made in our name by calling ${s.phone_primary}. Never hand over your original passport or pay money to anyone without a written receipt from our office.`,
          actions: [a.call(l)],
        };

      case 'status':
        return {
          text: hi
            ? 'मैं आपके आवेदन की स्थिति नहीं देख सकता। कृपया हमारी टीम को कॉल या व्हाट्सएप करें — वे आपकी जानकारी कन्फर्म करेंगे।'
            : 'I can’t see individual applications. Please call or WhatsApp our team and they will check your status for you.',
          actions: [a.call(l), a.whatsapp(l)],
        };
    }
  }

  private serviceAnswer(svc: (typeof SERVICES)[number], l: AssistantLang): AssistantReply {
    const hi = l === 'hi';
    return {
      text: `${svc.title}: ${svc.summary} ${svc.body} ${hi ? 'उदाहरण' : 'Typical roles'}: ${svc.roles.join(', ')}.`,
      actions: [
        { label: hi ? 'इस सेवा के बारे में' : 'Read about this service', route: '/services', fragment: svc.slug },
        this.actions.employer(l),
      ],
    };
  }

  /** Live vacancies from the API — never invented. */
  private async jobsAnswer(l: AssistantLang): Promise<AssistantReply> {
    const hi = l === 'hi';
    try {
      const res = await firstValueFrom(this.api.jobs({ limit: 5 }));
      if (res.items.length) {
        const list = res.items.map((j) => `${j.title} (${[j.city, j.country].filter(Boolean).join(', ')})`).join('; ');
        return {
          text: (hi ? 'अभी प्रकाशित वैकेंसी: ' : 'Currently published vacancies: ') + list + '.',
          actions: [
            ...res.items.slice(0, 3).map((j) => ({ label: j.title, route: `/jobs/${j.slug}` })),
            this.actions.candidate(l),
          ],
        };
      }
      return {
        text: hi
          ? 'अभी वेबसाइट पर कोई वैकेंसी प्रकाशित नहीं है। नियोक्ता की पुष्टि के बाद नई वैकेंसी जोड़ी जाती हैं। अपना प्रोफ़ाइल रजिस्टर करें — उपयुक्त नौकरी आने पर हम संपर्क करेंगे।'
          : 'There are no vacancies published on the website right now — new ones are added once an employer confirms the requirement. Register your profile and we’ll contact you when a suitable job is available.',
        actions: [this.actions.candidate(l), this.actions.whatsapp(l)],
      };
    } catch {
      return {
        text: hi
          ? 'मैं अभी वैकेंसी की सूची लोड नहीं कर सका। कृपया हमारी टीम से वर्तमान वैकेंसी के बारे में पूछें।'
          : 'I couldn’t load the vacancy list right now. Please ask our team about current openings.',
        actions: [this.actions.call(l), this.actions.candidate(l)],
      };
    }
  }

  private fallback(l: AssistantLang): AssistantReply {
    const hi = l === 'hi';
    return {
      text: hi
        ? 'माफ़ कीजिए, इस बारे में वेबसाइट पर जानकारी नहीं है, इसलिए मैं अनुमान नहीं लगाऊंगा। हमारी भर्ती टीम आपको सही जानकारी देगी। आप मुझसे सेवाओं, पंजीकरण, दस्तावेज़ों, प्रक्रिया या संपर्क के बारे में पूछ सकते हैं।'
        : 'Sorry, the website doesn’t have information on that, so I won’t guess — our recruitment team can confirm it for you. You can ask me about our services, registration, documents, the process or how to contact us.',
      actions: [this.actions.call(l), this.actions.whatsapp(l), this.actions.contact(l)],
    };
  }
}
