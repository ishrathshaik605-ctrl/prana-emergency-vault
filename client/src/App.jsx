import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { VoiceProvider } from './context/VoiceContext';
import { Header } from './components/Header';
import { EmergencyModeModal } from './components/EmergencyModeModal';
import { PrintableCard } from './components/PrintableCard';
import { FeaturePhoneSimulator } from './components/FeaturePhoneSimulator';
import { LiveAlertToast } from './components/LiveAlertToast';
import { 
  getStoredVaultId, 
  setStoredVaultId, 
  getUserVaults, 
  getActiveUserVault, 
  detectAndSaveDeviceIp 
} from './utils/vaultStorage';

import { HomePage } from './pages/HomePage';
import { EmergencyPortal } from './pages/EmergencyPortal';
import { VaultSetupPage } from './pages/VaultSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuditReportPage } from './pages/AuditReportPage';

function AppContent() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'emergency' | 'setup' | 'dashboard' | 'audit'
  const [selectedVaultId, setSelectedVaultId] = useState(() => getStoredVaultId() || 'AV-8842');
  const [activeVaultData, setActiveVaultData] = useState(() => getActiveUserVault());

  // Modal visibility states
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isPrintableOpen, setIsPrintableOpen] = useState(false);
  const [isFeaturePhoneOpen, setIsFeaturePhoneOpen] = useState(false);
  const [autoOpenEdit, setAutoOpenEdit] = useState(false);

  // Check URL params, pathname, hash, or device storage on load
  useEffect(() => {
    // Detect & save device IP in the background
    detectAndSaveDeviceIp();

    // 1. Search Query Parameters (?v=AV-8842 or ?vault=AV-8842)
    const params = new URLSearchParams(window.location.search);
    let vParam = params.get('v') || params.get('vault');

    // 2. Direct Pathname (/e/AV-8842 or /emergency/AV-8842)
    if (!vParam && window.location.pathname) {
      const pathMatch = window.location.pathname.match(/\/(?:e|emergency|vault)\/([A-Za-z0-9-]+)/i);
      if (pathMatch) {
        vParam = pathMatch[1];
      }
    }

    // 3. Hash Parameter for Offline Hybrid QR (#v=AV-8842)
    if (!vParam && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      vParam = hashParams.get('v');
    }

    if (vParam) {
      setSelectedVaultId(vParam.toUpperCase());
      setCurrentPage('emergency');
    } else {
      const storedId = getStoredVaultId();
      if (storedId) {
        setSelectedVaultId(storedId);
        const storedVault = getActiveUserVault();
        if (storedVault) {
          setActiveVaultData(storedVault);
        }
      }
    }
  }, []);

  const handleSelectVault = (id) => {
    const cleanId = id.toUpperCase();
    setSelectedVaultId(cleanId);
    setStoredVaultId(cleanId);
    
    // Check if this vault is in local storage
    const vaults = getUserVaults();
    const match = vaults.find(v => v.id && v.id.toUpperCase() === cleanId);
    if (match) {
      setActiveVaultData(match);
    }
    setCurrentPage('emergency');
  };

  const handleStartSetup = () => {
    setCurrentPage('setup');
  };

  const handleOpenDashboard = (vaultId = null, options = {}) => {
    const idToUse = vaultId || selectedVaultId;
    if (idToUse) {
      const cleanId = idToUse.toUpperCase();
      setSelectedVaultId(cleanId);
      setStoredVaultId(cleanId);
      const match = getUserVaults().find(v => v.id && v.id.toUpperCase() === cleanId);
      if (match) setActiveVaultData(match);
    }
    if (options && options.autoEdit) {
      setAutoOpenEdit(true);
    }
    setCurrentPage('dashboard');
  };

  const handleSetupComplete = (newVaultId, createdVault = null) => {
    const vId = (newVaultId || (createdVault && createdVault.id)).toUpperCase();
    setSelectedVaultId(vId);
    setStoredVaultId(vId);

    let fullVault = createdVault;
    if (!fullVault) {
      const vaults = getUserVaults();
      fullVault = vaults.find(v => v.id && v.id.toUpperCase() === vId);
    }

    if (fullVault) {
      setActiveVaultData(fullVault);
    }

    // Immediately trigger printable QR badge modal with the new user's personal details
    setIsPrintableOpen(true);
    setCurrentPage('dashboard');
  };

  const handleOpenPrintable = (vault = null) => {
    const userVaults = getUserVaults();
    if (vault && vault.id) {
      const fresh = userVaults.find(v => v.id && v.id.toUpperCase() === vault.id.toUpperCase()) || vault;
      setActiveVaultData(fresh);
      setIsPrintableOpen(true);
      return;
    }

    // 1. Check if currently selected vault exists in user's device storage
    const match = userVaults.find(v => v.id && v.id.toUpperCase() === selectedVaultId.toUpperCase());
    if (match) {
      setActiveVaultData(match);
      setIsPrintableOpen(true);
      return;
    }

    // 2. Check active user vault
    const activeUser = getActiveUserVault();
    if (activeUser) {
      setActiveVaultData(activeUser);
      setIsPrintableOpen(true);
      return;
    }
    if (activeUser) {
      setActiveVaultData(activeUser);
      setIsPrintableOpen(true);
      return;
    }

    // 3. Fall back to demo persona only if no user vaults exist on this device
    setActiveVaultData({
      id: selectedVaultId || 'AV-8842',
      owner_name: selectedVaultId === 'AV-7721' ? 'Priya Sharma' : 'Ramesh Patel',
      blood_group: selectedVaultId === 'AV-7721' ? 'O-ve' : 'B+ve',
      allergies: selectedVaultId === 'AV-7721' ? 'Sulfa Drugs' : 'Severe Penicillin Allergy',
      emergency_contacts: [
        { name: 'Suresh Patel', relationship: 'Son', phone: '+919825099991' },
        { name: 'Geeta Patel', relationship: 'Daughter', phone: '+919825099992' }
      ]
    });
    setIsPrintableOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans transition-colors selection:bg-red-500 selection:text-white">
      {/* Header */}
      <Header
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenPrintable={() => handleOpenPrintable()}
        onOpenFeaturePhone={() => setIsFeaturePhoneOpen(true)}
        onOpenAudit={() => setCurrentPage('audit')}
        onOpenDashboard={handleOpenDashboard}
        currentVaultId={selectedVaultId}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onSelectVault={handleSelectVault}
            onStartSetup={handleStartSetup}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenPrintable={() => handleOpenPrintable()}
            onOpenFeaturePhone={() => setIsFeaturePhoneOpen(true)}
            onOpenAudit={() => setCurrentPage('audit')}
            onOpenDashboard={handleOpenDashboard}
            currentVaultId={selectedVaultId}
          />
        )}

        {currentPage === 'emergency' && (
          <EmergencyPortal
            vaultId={selectedVaultId}
            onBack={() => setCurrentPage('home')}
            onOpenDashboard={handleOpenDashboard}
          />
        )}

        {currentPage === 'setup' && (
          <VaultSetupPage
            onComplete={handleSetupComplete}
            onCancel={() => setCurrentPage('home')}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            vaultId={selectedVaultId}
            onSelectVault={(id) => setSelectedVaultId(id)}
            onOpenEmergency={(id) => {
              if (id) setSelectedVaultId(id);
              setCurrentPage('emergency');
            }}
            onStartSetup={handleStartSetup}
            onOpenPrintable={handleOpenPrintable}
            onOpenAudit={() => setCurrentPage('audit')}
            onBack={() => setCurrentPage('home')}
            autoOpenEdit={autoOpenEdit}
            onClearAutoEdit={() => setAutoOpenEdit(false)}
          />
        )}

        {currentPage === 'audit' && (
          <AuditReportPage
            vaultId={selectedVaultId}
            onBack={() => setCurrentPage('home')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Prana" className="w-5 h-5 rounded-md object-cover bg-black border border-slate-800" />
            <span><strong>{t('app_name')}</strong> • {t('philosophy')}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setCurrentPage('home')} className="hover:underline">{t('back_to_home') || 'Home'}</button>
            <button onClick={() => setCurrentPage('audit')} className="hover:underline">{t('audit_log')}</button>
            <button onClick={() => setIsFeaturePhoneOpen(true)} className="hover:underline">{t('feature_phone_btn')}</button>
            <button onClick={() => handleOpenPrintable()} className="hover:underline">{t('print_card_btn')}</button>
          </div>
        </div>
      </footer>

      {/* Modals & Real-Time Components */}
      <EmergencyModeModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onShowMedical={() => {
          setCurrentPage('emergency');
        }}
        defaultVaultId={selectedVaultId}
      />

      <PrintableCard
        isOpen={isPrintableOpen}
        vault={activeVaultData}
        onClose={() => setIsPrintableOpen(false)}
        onBackToVault={() => {
          setIsPrintableOpen(false);
          const vId = activeVaultData?.id || selectedVaultId;
          if (vId) {
            setSelectedVaultId(vId);
          }
          setCurrentPage('dashboard');
        }}
      />

      <FeaturePhoneSimulator
        isOpen={isFeaturePhoneOpen}
        onClose={() => setIsFeaturePhoneOpen(false)}
        defaultVaultId={selectedVaultId}
      />

      <LiveAlertToast
        onOpenAudit={(vId) => {
          setSelectedVaultId(vId);
          setCurrentPage('audit');
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <VoiceProvider>
        <AppContent />
      </VoiceProvider>
    </LanguageProvider>
  );
}

export default App;
