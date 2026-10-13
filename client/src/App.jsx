import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { VoiceProvider } from './context/VoiceContext';
import { Header } from './components/Header';
import { EmergencyModeModal } from './components/EmergencyModeModal';
import { PrintableCard } from './components/PrintableCard';
import { FeaturePhoneSimulator } from './components/FeaturePhoneSimulator';
import { LiveAlertToast } from './components/LiveAlertToast';

import { HomePage } from './pages/HomePage';
import { EmergencyPortal } from './pages/EmergencyPortal';
import { VaultSetupPage } from './pages/VaultSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuditReportPage } from './pages/AuditReportPage';

function AppContent() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'emergency' | 'setup' | 'dashboard' | 'audit'
  const [selectedVaultId, setSelectedVaultId] = useState('AV-8842');
  const [activeVaultData, setActiveVaultData] = useState(null);

  // Modal visibility states
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isPrintableOpen, setIsPrintableOpen] = useState(false);
  const [isFeaturePhoneOpen, setIsFeaturePhoneOpen] = useState(false);

  // Check URL params on load (e.g. ?v=AV-8842 or /emergency/AV-8842)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vParam = params.get('v') || params.get('vault');
    if (vParam) {
      setSelectedVaultId(vParam.toUpperCase());
      setCurrentPage('emergency');
    }
  }, []);

  const handleSelectVault = (id) => {
    setSelectedVaultId(id);
    setCurrentPage('emergency');
  };

  const handleStartSetup = () => {
    setCurrentPage('setup');
  };

  const handleSetupComplete = (newVaultId) => {
    setSelectedVaultId(newVaultId);
    setCurrentPage('dashboard');
  };

  const handleOpenPrintable = (vault = null) => {
    if (vault) {
      setActiveVaultData(vault);
    } else {
      // Default to Ramesh Patel
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
    }
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
          />
        )}

        {currentPage === 'emergency' && (
          <EmergencyPortal
            vaultId={selectedVaultId}
            onBack={() => setCurrentPage('home')}
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
            onOpenPrintable={handleOpenPrintable}
            onOpenAudit={() => setCurrentPage('audit')}
            onBack={() => setCurrentPage('home')}
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
          <div>
            <strong>{t('app_name')}</strong> • {t('controlled_access')}
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
        vault={activeVaultData}
        onClose={() => setIsPrintableOpen(false)}
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
