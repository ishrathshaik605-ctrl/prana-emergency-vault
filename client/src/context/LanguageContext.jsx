import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translations } from '../i18n/translations';
import { translateName as baseTranslateName, translateRelationship as baseTranslateRelationship } from '../utils/nameTranslator';

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
  const audioRef = useRef(null);

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
    const voices = availableVoices.length > 0 
      ? availableVoices 
      : (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);
    if (!voices || !voices.length) return null;

    const langTagMap = {
      en: ['en'],
      hi: ['hi', 'hin'],
      kn: ['kn', 'kan'],
      ta: ['ta', 'tam'],
      te: ['te', 'tel'],
      bn: ['bn', 'ben'],
      mr: ['mr', 'mar']
    };
    const prefixes = langTagMap[targetLang] || ['en'];

    // 1. Direct match on BCP-47 tag (e.g. te-IN, te_IN, tel-IN, te)
    let match = voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return prefixes.some(p => vLang === p || vLang.startsWith(`${p}-`));
    });

    // 2. Fallback to voice name match
    if (!match) {
      const nameKeywords = {
        hi: ['hindi', 'हिन्दी', 'heera', 'kalpana', 'madhur', 'swara'],
        kn: ['kannada', 'ಕನ್ನಡ', 'gagan', 'sapna'],
        ta: ['tamil', 'தமிழ்', 'valluvar', 'iniya'],
        te: ['telugu', 'తెలుగు', 'mohan', 'shruti'],
        bn: ['bengali', 'bangla', 'বাংলা', 'bashkar', 'tanishaa'],
        mr: ['marathi', 'मराठी', 'aarohi', 'manohar'],
        en: ['india', 'indian', 'ravi', 'heera', 'neerja', 'david', 'zira', 'mark', 'google us english', 'en-in', 'en-us']
      };
      const keys = nameKeywords[targetLang] || [];
      match = voices.find(v => {
        const vName = v.name.toLowerCase();
        return keys.some(k => vName.includes(k));
      });
    }

    // Crucial: NEVER fall back to an English voice for Indic languages!
    return match || null;
  };

  /**
   * Voice Readout: Speaks text aloud in the target language.
   * If local OS voice pack is installed, uses Web Speech API.
   * If local Indic voice is missing (common on Windows), uses streaming Indic TTS audio for authentic native pronunciation.
   */
  const speakText = (text, explicitLang = null) => {
    if (!text) return;
    const targetLang = explicitLang || lang;

    // Immediately cancel any active speech or playing audio
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    const matchedVoice = findBestVoice(targetLang);

    // If native system voice found for targetLang OR targetLang is English:
    if (matchedVoice || targetLang === 'en') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
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
        utterance.rate = 0.88;
        utterance.pitch = 1.0;
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
        window.speechSynthesis.speak(utterance);
        return;
      }
    }

    // For non-English languages when OS has no native Indic voice installed (common on Windows desktop):
    // Use high-fidelity Indic TTS audio stream (/api/tts proxy with Google TTS fallback)
    try {
      const cleanText = text.length > 190 ? text.slice(0, 185) + '...' : text;
      // 1. Try our backend proxy route first
      const proxyUrl = `/api/tts?q=${encodeURIComponent(cleanText)}&lang=${targetLang}`;
      const audio = new Audio(proxyUrl);
      audioRef.current = audio;

      audio.play().catch((proxyErr) => {
        console.warn('Backend TTS proxy failed, attempting direct no-referrer TTS stream:', proxyErr);
        // 2. Direct client fallback with no-referrer
        try {
          const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${targetLang}&client=tw-ob`;
          const directAudio = new Audio(directUrl);
          audioRef.current = directAudio;
          directAudio.play().catch((directErr) => {
            console.warn('Direct TTS audio failed:', directErr);
          });
        } catch (e) {
          console.error('Audio TTS initialization error:', e);
        }
      });
    } catch (err) {
      console.error('Audio TTS error:', err);
    }
  };

  /**
   * Translates given name / owner name to current selected language
   */
  const translateName = (name, explicitLang = null) => {
    return baseTranslateName(name, explicitLang || lang);
  };

  /**
   * Translates relationship descriptions like "Son", "Brother", etc. to current language
   */
  const translateRelationship = (rel, explicitLang = null) => {
    return baseTranslateRelationship(rel, explicitLang || lang);
  };

  /**
   * Generates localized speech text for patient's medical lifesaver card
   */
  const formatMedicalSpeech = (data) => {
    if (!data) return '';
    const name = translateName(data.owner_name || '', lang);
    const bg = data.blood_group || '';
    const allergies = data.critical_allergies || '';
    const conditions = data.critical_conditions || '';
    const contactName = data.emergency_contacts?.[0] ? translateName(data.emergency_contacts[0].name, lang) : '';
    const contactPhone = data.emergency_contacts?.[0]?.phone || '';
    const contact = contactName ? `${contactName}, ${contactPhone}` : '';

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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
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
      translateName,
      translateRelationship,
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
