import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Cloud, 
  CloudOff, 
  HardDrive, 
  Sparkles, 
  Clock, 
  X,
  Database,
  Layers,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { offlineSyncManager, OfflineSyncItem } from '../services/offlineSync';

export const OfflineSyncBadge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [syncState, setSyncState] = useState({
    isOnline: true,
    isSimulatedOffline: false,
    effectiveOnline: true,
    queue: [] as OfflineSyncItem[],
    isSyncing: false,
    lastSyncedAt: null as string | null
  });
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncManager.subscribe((state) => {
      setSyncState(state);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    if (syncState.isSimulatedOffline) {
      // Prompt user to turn off offline mode first
      offlineSyncManager.setSimulatedOffline(false);
    }
    const result = await offlineSyncManager.autoSync();
    if (result.success && result.count > 0) {
      setJustSynced(true);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.2 },
        colors: ['#D4AF37', '#C72C48', '#2D6A4F']
      });
      setTimeout(() => setJustSynced(false), 2500);
    }
  };

  const toggleOfflineSimulation = () => {
    offlineSyncManager.setSimulatedOffline(!syncState.isSimulatedOffline);
  };

  const pendingCount = syncState.queue.length;

  return (
    <div className="relative inline-block text-left" id="offline-sync-container">
      {/* Trigger Pill */}
      <button
        id="offline-sync-badge-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs border ${
          !syncState.effectiveOnline
            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 ring-2 ring-amber-400/20'
            : pendingCount > 0
            ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
            : syncState.isSyncing
            ? 'bg-purple-50 text-purple-800 border-purple-300 animate-pulse'
            : 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/90'
        }`}
        title="Offline Sync & Local Cache Status"
      >
        {!syncState.effectiveOnline ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-bold">Offline</span>
            {pendingCount > 0 && (
              <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </>
        ) : syncState.isSyncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
            <span className="text-[11px] font-bold hidden sm:inline">Syncing...</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span className="text-[11px] font-bold">{pendingCount} Queued</span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-bold hidden sm:inline">Offline-Ready</span>
          </>
        )}

        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-[#FFFDF9] border border-[#E8DFC8] shadow-2xl z-50 p-4 overflow-hidden"
              id="offline-sync-popover"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]/60">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${syncState.effectiveOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {syncState.effectiveOnline ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#3D2C24]">Offline Sync Engine</h4>
                    <p className="text-[10px] text-[#8C7A6B]">
                      {syncState.effectiveOnline ? 'All changes backed up & cloud synced' : 'Changes queued locally in device storage'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-[#FAF7F2] text-[#8C7A6B]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status Simulation Switch */}
              <div className="mt-3 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8]/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-[#3D2C24] flex items-center gap-1.5">
                    <span>Simulate Offline Mode</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#8C6B24] font-semibold">Test</span>
                  </div>
                  <p className="text-[10px] text-[#8C7A6B]">Experience offline shopping & queuing</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={syncState.isSimulatedOffline} 
                    onChange={toggleOfflineSimulation} 
                    className="sr-only peer"
                    id="toggle-simulate-offline"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C72C48]"></div>
                </label>
              </div>

              {/* Local Storage Cache Stats */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white border border-[#E8DFC8]/60">
                  <div className="text-[10px] uppercase tracking-wider text-[#8C7A6B] font-bold">Storage State</div>
                  <div className="text-xs font-bold text-[#3D2C24] mt-0.5 flex items-center justify-center gap-1">
                    <Database className="w-3 h-3 text-[#D4AF37]" />
                    <span>Offline-Cached</span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-[#E8DFC8]/60">
                  <div className="text-[10px] uppercase tracking-wider text-[#8C7A6B] font-bold">Last Synced</div>
                  <div className="text-xs font-bold text-[#3D2C24] mt-0.5 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-[#2D6A4F]" />
                    <span>{syncState.lastSyncedAt || 'Just now'}</span>
                  </div>
                </div>
              </div>

              {/* Pending Queue List */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-[#3D2C24] flex items-center gap-1">
                    <span>Pending Queue</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E8DFC8] text-[#3D2C24]">
                      {pendingCount}
                    </span>
                  </span>
                  {pendingCount > 0 && (
                    <button 
                      onClick={() => offlineSyncManager.clearQueue()}
                      className="text-[10px] text-[#C72C48] hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {pendingCount === 0 ? (
                  <div className="p-3 text-center rounded-xl bg-white border border-dashed border-[#E8DFC8] text-[#8C7A6B]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-[11px] font-medium text-[#3D2C24]">No pending mutations</p>
                    <p className="text-[10px] text-[#8C7A6B]">Every design, quote and chat is synchronized.</p>
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {syncState.queue.map((item) => (
                      <div 
                        key={item.id}
                        className="p-2 rounded-lg bg-white border border-[#E8DFC8] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                          <span className="font-medium text-[#3D2C24] truncate">{item.label}</span>
                        </div>
                        <span className="text-[9px] text-[#8C7A6B] shrink-0">{item.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sync Action Button */}
              <div className="mt-4 pt-3 border-t border-[#E8DFC8]/60">
                <button
                  id="btn-trigger-manual-sync"
                  disabled={syncState.isSyncing}
                  onClick={handleManualSync}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-sm ${
                    syncState.isSyncing
                      ? 'bg-[#8C7A6B] cursor-wait'
                      : 'bg-[#3D2C24] hover:bg-[#251A14] active:scale-[0.98]'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
                  <span>
                    {syncState.isSyncing 
                      ? 'Synchronizing Cloud Vault...' 
                      : pendingCount > 0 
                      ? `Sync ${pendingCount} Pending Updates Now` 
                      : 'Sync Everything with Cloud'}
                  </span>
                </button>
              </div>

              {justSynced && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-center text-[11px] font-bold text-emerald-700 bg-emerald-50 py-1 rounded-lg border border-emerald-200"
                >
                  ✨ Offline Sync Complete!
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
