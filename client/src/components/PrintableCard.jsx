import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Printer, ShieldAlert, Phone, HeartPulse, X, Download, Smartphone, ArrowLeft } from 'lucide-react';

export function PrintableCard({ vault, onClose }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet' | 'sticker' | 'wallpaper'

  const getInitialBaseUrl = () => {
    if (typeof window !== 'undefined') {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return window.location.origin;
      }
      return `http://10.125.177.231:${window.location.port || '3000'}`;
    }
    return 'http://10.125.177.231:3000';
  };

  const [customBaseUrl, setCustomBaseUrl] = useState(getInitialBaseUrl);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!vault) return;
    const c1 = vault.emergency_contacts && vault.emergency_contacts[0]
      ? `&c1=${encodeURIComponent(vault.emergency_contacts[0].name + ':' + vault.emergency_contacts[0].phone)}`
      : '';
    const base = (customBaseUrl || window.location.origin).replace(/\/+$/, '');
    const qrPayload = `${base}/?v=${vault.id}#v=${vault.id}&n=${encodeURIComponent(vault.owner_name)}&bg=${encodeURIComponent(vault.blood_group || '')}&al=${encodeURIComponent(vault.allergies || 'None')}${c1}`;

    QRCode.toDataURL(qrPayload, {
      width: 256,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [vault, customBaseUrl]);

  if (!vault) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 modal-backdrop overflow-y-auto cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="printable-card-title"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-100 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8 border border-slate-300 cursor-default"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-300 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-6 h-6 text-red-600" />
            <h3 id="printable-card-title" className="text-xl font-black text-slate-900">
              Printable Lifesaver Assets & QR Codes
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close printable modal"
            className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>Close ✕</span>
          </button>
        </div>

        {/* QR Destination Target Selector */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 mt-3 no-print text-xs shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <span>🎯 QR Code Scans Will Open:</span>
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setCustomBaseUrl(`http://10.125.177.231:${window.location.port || '3000'}`)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  customBaseUrl.includes('10.125.177.231') 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📱 Mobile Wi-Fi (10.125.177.231)
              </button>
              <button
                type="button"
                onClick={() => setCustomBaseUrl(window.location.origin)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  customBaseUrl === window.location.origin && !customBaseUrl.includes('10.125.177.231')
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                🌐 Current Origin
              </button>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={customBaseUrl}
              onChange={(e) => setCustomBaseUrl(e.target.value)}
              placeholder="e.g. http://10.125.177.231:3000 or https://your-app.onrender.com"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-mono text-[11px] text-slate-800 focus:outline-none focus:border-red-500 bg-slate-50"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            💡 <strong>Why this matters:</strong> Phones cannot reach "localhost". Use the <strong>Mobile Wi-Fi</strong> button so any phone connected to your Wi-Fi can scan the card!
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 my-4 no-print">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wallet' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-slate-700'
            }`}
          >
            💳 Wallet Card (Front & Back)
          </button>
          <button
            onClick={() => setActiveTab('sticker')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sticker' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-slate-700'
            }`}
          >
            🏍️ Helmet / Vehicle Sticker
          </button>
          <button
            onClick={() => setActiveTab('wallpaper')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wallpaper' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-slate-700'
            }`}
          >
            📱 Phone Lock-Screen Wallpaper
          </button>
        </div>

        {/* Render Tab Contents */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center justify-center">
          {activeTab === 'wallet' && (
            <div className="space-y-6 w-full max-w-md">
              {/* CARD FRONT */}
              <div className="w-full aspect-[1.586/1] bg-gradient-to-br from-red-600 to-rose-800 text-white rounded-2xl p-5 shadow-xl border-2 border-red-900 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/logo-icon.png" alt="Prana" className="w-6 h-6 rounded-md object-cover bg-black border border-white/30" />
                    <span className="text-xs uppercase font-black tracking-widest text-red-100">
                      EMERGENCY MEDICAL ID
                    </span>
                  </div>
                  <div className="bg-white text-red-600 px-2.5 py-0.5 rounded-lg text-xs font-black shadow-xs">
                    PRANA
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 my-2">
                  <div>
                    <h4 className="text-xl font-black tracking-tight">{vault.owner_name}</h4>
                    <p className="text-xs text-red-100">Vault ID: {vault.id}</p>
                    <p className="text-xs font-semibold text-yellow-200 mt-1 line-clamp-1">
                      ⚠️ {vault.allergies || 'Severe Drug Allergy'}
                    </p>
                  </div>

                  <div className="bg-white text-red-600 rounded-xl px-3 py-1.5 text-center shadow-md shrink-0">
                    <span className="text-[9px] uppercase font-black text-slate-500 block">BLOOD</span>
                    <span className="text-2xl font-black leading-none">{vault.blood_group}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-red-100 pt-2 border-t border-red-500/50">
                  <span>Emergency: 108 / 112</span>
                  <span>Scan Back for Full Medical Info</span>
                </div>
              </div>

              {/* CARD BACK */}
              <div className="w-full aspect-[1.586/1] bg-white text-slate-900 rounded-2xl p-5 shadow-xl border-2 border-slate-300 flex items-center justify-between gap-4">
                <div className="space-y-1.5 text-left flex-1">
                  <span className="text-[10px] uppercase font-extrabold text-red-600 tracking-wider">
                    SCAN FOR LIFESAVING DETAILS
                  </span>
                  <div className="text-xs font-bold text-slate-800">
                    Contacts:
                  </div>
                  {vault.emergency_contacts?.slice(0, 2).map((c, i) => (
                    <div key={i} className="text-[11px] text-slate-700">
                      • {c.name} ({c.relationship}): <strong className="font-mono">{c.phone}</strong>
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-500 pt-1">
                    Hospital: {vault.hospital_name || 'Nearest ER Trauma Care'}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">
                    Feature phone SMS: "HELP {vault.id}" to 108
                  </div>
                </div>

                {qrDataUrl && (
                  <div className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs shrink-0 text-center">
                    <img src={qrDataUrl} alt="Emergency QR Code" className="w-24 h-24" />
                    <span className="text-[8px] font-black uppercase text-slate-500 block mt-0.5">SCAN ME</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sticker' && (
            <div className="p-6 rounded-3xl bg-amber-400 text-slate-950 border-4 border-black text-center max-w-sm w-full shadow-2xl flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <img src="/logo-icon.png" alt="Prana" className="w-8 h-8 rounded-lg object-cover bg-black border border-black shadow-xs" />
                <span className="text-xs font-black uppercase tracking-widest bg-black text-yellow-300 px-3 py-1 rounded-full">
                  HELMET / BIKE EMERGENCY STICKER
                </span>
              </div>
              <h4 className="text-2xl font-black uppercase tracking-tight">{vault.owner_name}</h4>
              <div className="text-lg font-black my-1">
                BLOOD: <span className="bg-red-600 text-white px-2 py-0.5 rounded-lg">{vault.blood_group}</span>
              </div>
              {qrDataUrl && (
                <div className="my-3 p-2 bg-white rounded-2xl border-2 border-black">
                  <img src={qrDataUrl} alt="Sticker QR Code" className="w-32 h-32" />
                </div>
              )}
              <div className="text-xs font-extrabold text-black">
                IN EMERGENCY: SCAN QR OR CALL 108
              </div>
            </div>
          )}

          {activeTab === 'wallpaper' && (
            <div className="w-64 aspect-[9/19] bg-black text-white rounded-[36px] p-4 shadow-2xl border-4 border-slate-700 flex flex-col justify-between text-center relative overflow-hidden">
              <div className="pt-2">
                <span className="text-2xl font-light">12:45</span>
                <p className="text-[10px] text-slate-400">Emergency Lock Screen</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 my-auto">
                <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                  ICE: IN CASE OF EMERGENCY
                </span>
                <h5 className="text-sm font-black mt-0.5">{vault.owner_name}</h5>
                <div className="text-xs font-black text-yellow-300 mt-0.5">
                  Blood Group: {vault.blood_group}
                </div>
                {qrDataUrl && (
                  <div className="my-2 p-1.5 bg-white rounded-xl mx-auto w-fit">
                    <img src={qrDataUrl} alt="Lockscreen QR" className="w-24 h-24" />
                  </div>
                )}
                <p className="text-[9px] text-slate-300">
                  Scan to unlock medical info & contact family
                </p>
              </div>

              <div className="pb-2 text-[10px] text-red-400 font-bold">
                Emergency Call: 108 / 112
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 no-print pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500 font-medium">
            Standard high-contrast QR encoded with offline critical medical details.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Vault</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-red-200 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
