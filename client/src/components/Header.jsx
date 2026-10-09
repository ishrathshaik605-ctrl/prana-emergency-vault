import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../context/VoiceContext';
import { 
  ShieldAlert, Volume2, Mic, Eye, Globe, PhoneCall, 
  HelpCircle, Printer, FileText, Smartphone 
} from 'lucide-react';

export function Header({ onOpenEmergency, onOpenPrintable, onOpenFeaturePhone, onOpenAudit, currentVaultId }) {
  const { lang, setLang, t, highContrast, setHighContrast, speakText } = useLanguage();
  const { startListening, isListening } = useVoice();

  const handleVoiceCommand = () => {
    startListening((command) => {
      if (command.includes('ambulance') || command.includes('108') || command.includes('hospital')) {
        speakText('Calling emergency ambulance 108');
        window.location.href = 'tel:108';
      } else if (command.includes('family') || command.includes('son') || command.includes('daughter')) {
        speakText('Opening family contacts');
        onOpenEmergency();
      } else if (command.includes('emergency') || command.includes('help')) {
        onOpenEmergency();
      } else {
        speakText(`Command recognized: ${command}`);
      }
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-200">
            <ShieldAlert className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
              AapatVault
            </h1>
            <span className="text-xs text-slate-500 font-medium">
              {t('tagline')}
            </span>
          </div>
        </div>

        {/* Accessibility & Voice Action Bar */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Language Switcher */}
          <div className="relative flex items-center bg-slate-100 rounded-lg px-2 py-1 border border-slate-300">
            <Globe className="w-4 h-4 text-slate-600 mr-1.5" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Select Application Language"
              className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            title="Toggle High Contrast Mode"
            aria-label="Toggle High Contrast Mode"
            className={`p-2 rounded-lg border font-medium text-xs flex items-center gap-1 transition-colors ${
              highContrast 
                ? 'bg-yellow-400 text-black border-yellow-500 font-bold' 
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Contrast</span>
          </button>

          {/* Voice Speak Navigation */}
          <button
            onClick={handleVoiceCommand}
            title="Speak a voice command"
            aria-label="Speak a voice command"
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
              isListening
                ? 'bg-red-600 text-white border-red-700 animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
          </button>

          {/* Feature Phone Simulator Button */}
          {onOpenFeaturePhone && (
            <button
              onClick={onOpenFeaturePhone}
              title="Test SMS / USSD Feature Phone Fallback"
              aria-label="Test SMS / USSD Feature Phone Fallback"
              className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">Feature Phone</span>
            </button>
          )}

          {/* Printable Card / Lock Screen */}
          {onOpenPrintable && (
            <button
              onClick={onOpenPrintable}
              title="Print Physical Wallet Card & Sticker"
              aria-label="Print Physical Wallet Card & Sticker"
              className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-300 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Print Card</span>
            </button>
          )}

          {/* Giant Emergency Mode Button */}
          <button
            onClick={onOpenEmergency}
            aria-label="Activate Emergency Mode"
            className="px-3.5 py-2 rounded-xl bg-red-600 text-white font-extrabold text-sm tracking-wide shadow-md shadow-red-200 hover:bg-red-700 active:scale-95 flex items-center gap-1.5 transition-all"
          >
            <ShieldAlert className="w-5 h-5 animate-bounce" />
            <span>EMERGENCY MODE</span>
          </button>
        </div>
      </div>
    </header>
  );
}
