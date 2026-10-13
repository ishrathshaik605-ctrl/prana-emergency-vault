import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Smartphone, Send, PhoneCall, Volume2, X, Sparkles } from 'lucide-react';

export function FeaturePhoneSimulator({ isOpen, onClose, defaultVaultId = 'AV-8842' }) {
  const { t, speakText } = useLanguage();
  const [dialText, setDialText] = useState(`*999*${defaultVaultId}#`);
  const [smsQuery, setSmsQuery] = useState(`HELP ${defaultVaultId}`);
  const [mode, setMode] = useState('ussd'); // 'ussd' | 'sms'
  const [screenOutput, setScreenOutput] = useState('');
  const [loading, setLoading] = useState(false);

  // In real keypad mobile: pressing physical key '1' triggers IVR voice readout
  useEffect(() => {
    if (!isOpen || !screenOutput) return;
    const handleKeyDown = (e) => {
      if (e.key === '1' && e.target.tagName !== 'INPUT') {
        speakText(screenOutput);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, screenOutput, speakText]);

  if (!isOpen) return null;

  const handleExecute = async () => {
    setLoading(true);
    setScreenOutput('Connecting to GSM / USSD Gateway...');

    try {
      const payload = mode === 'ussd'
        ? { dial_code: dialText }
        : { sms_text: smsQuery };

      const res = await fetch('/api/ussd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      const output = data.sms_response || data.message || 'No response';
      setScreenOutput(output);

      // Automatically speak the response for rural low-literacy scenarios
      speakText(output);
    } catch (err) {
      setScreenOutput('Error: Unable to connect to emergency cellular gateway.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 modal-backdrop animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-phone-title"
    >
      <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border-4 border-slate-700 relative">
        <button
          onClick={onClose}
          aria-label="Close feature phone simulator"
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <h3 id="feature-phone-title" className="text-sm font-black uppercase tracking-wider text-slate-200">
            {t('feature_phone_sim')}
          </h3>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-3 text-xs">
          <button
            onClick={() => setMode('ussd')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
              mode === 'ussd' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            USSD (*999*ID#)
          </button>
          <button
            onClick={() => setMode('sms')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
              mode === 'sms' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            SMS (HELP ID)
          </button>
        </div>

        {/* Realistic Feature Phone Monochrome Screen */}
        <div className="bg-[#8fae85] text-[#1b2b18] font-mono p-4 rounded-xl border-4 border-slate-800 shadow-inner min-h-[170px] flex flex-col justify-between text-xs leading-relaxed overflow-y-auto">
          {screenOutput ? (
            <div className="whitespace-pre-wrap font-bold select-all">
              {screenOutput}
            </div>
          ) : (
            <div className="text-center py-6 text-emerald-950 font-bold">
              {mode === 'ussd' ? `Dial: ${dialText}` : `SMS: "${smsQuery}" to 108`}
              <div className="text-[10px] opacity-75 mt-2">
                Press [CALL / SEND] to test instant cellular query without internet
              </div>
            </div>
          )}

          {screenOutput && (
            <div className="mt-3 pt-2 border-t border-emerald-900/30 flex items-center justify-between gap-2">
              <button
                onClick={() => speakText(screenOutput)}
                className="py-1 px-2.5 rounded bg-emerald-900 hover:bg-emerald-950 text-emerald-100 text-[10px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t('voice_read')}</span>
              </button>
              <span className="text-[10px] text-emerald-950 font-bold font-mono bg-emerald-700/20 px-2 py-0.5 rounded">
                [Press '1' on Keypad]
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-4 flex gap-2">
          {mode === 'ussd' ? (
            <input
              type="text"
              value={dialText}
              onChange={(e) => setDialText(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none"
            />
          ) : (
            <input
              type="text"
              value={smsQuery}
              onChange={(e) => setSmsQuery(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none"
            />
          )}

          <button
            onClick={handleExecute}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shrink-0 disabled:opacity-50"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{loading ? 'Dialing...' : 'SEND'}</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-400 mt-3 text-center space-y-1">
          <p>
            Works on any basic 2G/4G keypad phone (JioBharat, Nokia) with zero data connection.
          </p>
          <p className="text-slate-500 text-[9px]">
            💡 <em>On a real keypad mobile: Voice is delivered via an automated toll-free IVR phone call by pressing key '1' on the physical keypad.</em>
          </p>
        </div>
      </div>
    </div>
  );
}
