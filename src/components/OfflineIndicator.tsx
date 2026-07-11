import React from 'react';
import { Wifi, WifiOff, Zap, ZapOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOffline: boolean;
  onToggleOffline: () => void;
  isDataSaver: boolean;
  onToggleDataSaver: () => void;
  language: 'en' | 'fr';
}

export default function OfflineIndicator({
  isOffline,
  onToggleOffline,
  isDataSaver,
  onToggleDataSaver,
  language,
}: OfflineIndicatorProps) {
  const t = {
    en: {
      online: 'Online Mode',
      offline: 'Offline Simulation Mode',
      simulated: 'Simulated Offline (PWA Ready)',
      dataSaverOn: 'Data Saver On (2G/3G Ready)',
      dataSaverOff: 'Data Saver Off',
      dataSaverDesc: 'Disables video previews and hides heavy images to run smoothly on low-bandwidth networks.',
    },
    fr: {
      online: 'Mode En Ligne',
      offline: 'Mode Simulation Hors Ligne',
      simulated: 'Hors ligne simulé (PWA Prêt)',
      dataSaverOn: 'Économiseur de données activé (2G/3G)',
      dataSaverOff: 'Économiseur de données désactivé',
      dataSaverDesc: 'Désactive les vidéos et cache les images lourdes pour un chargement fluide en bas débit.',
    }
  }[language];

  return (
    <div className="bg-slate-50 border-b border-slate-200 py-2 px-4 flex flex-wrap gap-4 items-center justify-between text-xs">
      {/* Offline simulation toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleOffline}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
            isOffline
              ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
              : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-100'
          }`}
          title="Click to toggle offline simulation"
          id="offline-toggle-btn"
        >
          {isOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>{t.simulated}</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>{t.online}</span>
            </>
          )}
        </button>

        {isOffline && (
          <span className="text-slate-500 animate-pulse hidden sm:inline">
            {language === 'en' ? 'Using local storage cached data' : 'Utilisation des données locales en cache'}
          </span>
        )}
      </div>

      {/* Low bandwidth data-saver toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleDataSaver}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
            isDataSaver
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          title={t.dataSaverDesc}
          id="datasaver-toggle-btn"
        >
          {isDataSaver ? (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>{t.dataSaverOn}</span>
            </>
          ) : (
            <>
              <ZapOff className="w-3.5 h-3.5" />
              <span>{t.dataSaverOff}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
