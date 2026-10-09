import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('aapat_lang') || 'en';
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('aapat_high_contrast') === 'true';
  });

  const [availableVoices, setAvailableVoices] = useState([]);
  const hasAnnouncedInitialRef = useRef(false);

  // Initialize and listen for available system voices
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
        }
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('aapat_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('aapat_high_contrast', highContrast ? 'true' : 'false');
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  /**
   * Selects best available system voice for the chosen language
   */
  const findBestVoice = (targetLang) => {
    if (!availableVoices.length) return null;

    const langTagMap = {
      en: 'en',
      hi: 'hi',
      kn: 'kn',
      ta: 'ta',
      te: 'te',
      bn: 'bn',
      mr: 'mr'
    };
    const prefix = langTagMap[targetLang] || 'en';

    // 1. Direct match on BCP-47 tag (e.g. hi-IN, ta-IN, kn-IN)
    let match = availableVoices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith(`${prefix}-`) || vLang === prefix;
    });

    // 2. Fallback to voice name match (e.g. Google हिन्दी, Microsoft Heera, Tamil, Telugu)
    if (!match) {
      const nameKeywords = {
        hi: ['hindi', 'हिन्दी', 'heera', 'kalpana', 'madhur', 'swara'],
        kn: ['kannada', 'ಕನ್ನಡ', 'gagan', 'sapna'],
        ta: ['tamil', 'தமிழ்', 'valluvar', 'iniya'],
        te: ['telugu', 'తెలుగు', 'mohan', 'shruti'],
        bn: ['bengali', 'bangla', 'বাংলা', 'bashkar', 'tanishaa'],
        mr: ['marathi', 'मराठी', 'aarohi', 'manohar'],
        en: ['india', 'indian', 'ravi', 'heera', 'neerja', 'en-in']
      };
      const keys = nameKeywords[targetLang] || [];
      match = availableVoices.find(v => {
        const vName = v.name.toLowerCase();
        return keys.some(k => vName.includes(k));
      });
    }

    // 3. Fallback to general Indian English voice if specific Indic engine not installed
    if (!match && targetLang !== 'en') {
      match = availableVoices.find(v => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'));
    }

    return match || null;
  };

  /**
   * Voice Readout: Speaks text aloud using Web Speech API in the target language
   */
  const speakText = (text, explicitLang = null) => {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    if (!text) return;

    window.speechSynthesis.cancel(); // Cancel any ongoing speech immediately
    const utterance = new SpeechSynthesisUtterance(text);
    
    const targetLang = explicitLang || lang;
    const langTagMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      kn: 'kn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      mr: 'mr-IN'
    };
    utterance.lang = langTagMap[targetLang] || 'en-IN';
    utterance.rate = 0.88; // Slightly measured rate for high-stress clarity
    utterance.pitch = 1.0;

    const matchedVoice = findBestVoice(targetLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  /**
   * Generates localized speech text for patient's medical lifesaver card
   */
  const formatMedicalSpeech = (data) => {
    if (!data) return '';
    const name = data.owner_name || '';
    const bg = data.blood_group || '';
    const allergies = data.critical_allergies || '';
    const conditions = data.critical_conditions || '';
    const contact = data.emergency_contacts?.[0] ? `${data.emergency_contacts[0].name}, ${data.emergency_contacts[0].phone}` : '';

    switch (lang) {
      case 'hi':
        return `रोगी का नाम: ${name}। रक्त समूह: ${bg}। गंभीर एलर्जी: ${allergies || 'कोई नहीं'}। चिकित्सा स्थिति: ${conditions || 'कोई नहीं'}। आपातकालीन संपर्क: ${contact}।`;
      case 'kn':
        return `ರೋಗಿಯ ಹೆಸರು: ${name}. ರಕ್ತದ ಗುಂಪು: ${bg}. ಗಂಭೀರ ಅಲರ್ಜಿ: ${allergies || 'ಯಾವುದೂ ಇಲ್ಲ'}. ಆರೋಗ್ಯ ಸಮಸ್ಯೆ: ${conditions || 'ಯಾವುದೂ ಇಲ್ಲ'}. ತುರ್ತು ಸಂಪರ್ಕ: ${contact}.`;
      case 'ta':
        return `நோயாளி பெயர்: ${name}. இரத்த வகை: ${bg}. ஒவ்வாமை: ${allergies || 'இல்லை'}. மருத்துவ பாதிப்பு: ${conditions || 'இல்லை'}. அவசர தொடர்பு: ${contact}.`;
      case 'te':
        return `రోగి పేరు: ${name}. రక్త వర్గం: ${bg}. తీవ్రమైన అలెర్జీలు: ${allergies || 'లేవు'}. ఆరోగ్య సమస్యలు: ${conditions || 'లేవు'}. అత్యవసర పరిచయం: ${contact}.`;
      case 'bn':
        return `রোগীর নাম: ${name}। রক্তের গ্রুপ: ${bg}। মারাত্মক অ্যালার্জি: ${allergies || 'নেই'}। স্বাস্থ্য সমস্যা: ${conditions || 'নেই'}। জরুরি যোগাযোগ: ${contact}।`;
      case 'mr':
        return `रुग्णाचे नाव: ${name}. रक्तगट: ${bg}. गंभीर ॲलर्जी: ${allergies || 'काही नाही'}. वैद्यकीय स्थिती: ${conditions || 'काही नाही'}. आपत्कालीन संपर्क: ${contact}.`;
      default:
        return `Patient name: ${name}. Blood group: ${bg}. Critical allergies: ${allergies || 'None reported'}. Medical conditions: ${conditions || 'None reported'}. Primary emergency contact: ${contact}.`;
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  /**
   * Switch language and immediately confirm by voice in the newly selected language
   */
  const changeLanguage = (newLang) => {
    setLang(newLang);
    const confirmation = translations[newLang]?.voice_lang_switched || `Language switched.`;
    // Slight timeout to let state update
    setTimeout(() => {
      speakText(confirmation, newLang);
    }, 150);
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang: changeLanguage,
      t,
      highContrast,
      setHighContrast,
      speakText,
      stopSpeaking,
      formatMedicalSpeech,
      availableVoices
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
