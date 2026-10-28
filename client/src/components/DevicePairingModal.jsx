import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useLanguage } from '../context/LanguageContext';
import { 
  Smartphone, QrCode, X, Copy, CheckCircle2, 
  ExternalLink, ArrowRight, ShieldCheck, Sparkles 
} from 'lucide-react';

export function DevicePairingModal({ isOpen, onClose, vault, onSimulatePair }) {
  const { t, translateName } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Determine base origin (supports local network IP if testing on WiFi)
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const pairingUrl = vault 
    ? `${getBaseUrl()}/?pair=${vault.id}&n=${encodeURIComponent(vault.owner_name || '')}&bg=${encodeURIComponent(vault.blood_group || '')}#pair=${vault.id}`
    : '';

  useEffect(() => {
    if (!vault || !pairingUrl) return;

    QRCode.toDataURL(pairingUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating pairing QR:', err));
  }, [vault, pairingUrl]);

  if (!isOpen || !vault) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(pairingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        // Fallback for older browsers
        const el = document.createElement('textarea');
        el.value = pairingUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.warn('Could not copy pairing link:', err);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 modal-backdrop animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-pairing-title"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-scale-up overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-200">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 id="device-pairing-title" className="text-base font-black text-slate-900 leading-tight">
                {t('pair_device_title')}
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {translateName(vault.owner_name)} • {vault.id}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Descriptive Banner */}
        <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t('pair_device_desc')}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="mt-4 flex flex-col items-center justify-center">
          <div className="p-3 bg-white rounded-2xl border-2 border-slate-900/10 shadow-lg relative group">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Device Pairing QR Code" 
                className="w-56 h-56 rounded-xl object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center bg-slate-50 rounded-xl text-xs text-slate-400">
                Generating secure pairing code...
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500 mt-2 bg-slate-100 px-3 py-1 rounded-full">
            Vault ID: {vault.id}
          </span>
        </div>

        {/* Step by Step Instructions */}
        <div className="mt-4 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
            <span>{t('pair_step_1')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
            <span>{t('pair_step_2')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
            <span>{t('pair_step_3')}</span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
          {/* Copy link button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
              copied 
                ? 'bg-emerald-600 text-white shadow-emerald-200' 
                : 'bg-slate-900 hover:bg-black text-white'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('pairing_link_copied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t('copy_pairing_link')}</span>
              </>
            )}
          </button>

          {/* Tester Helper to simulate pairing directly */}
          {onSimulatePair && (
            <button
              type="button"
              onClick={() => onSimulatePair(vault.id)}
              className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 underline text-center cursor-pointer py-1"
            >
              ⚡ Tester: Simulate Scanning on this Browser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
