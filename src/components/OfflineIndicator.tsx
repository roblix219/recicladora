import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  unsyncedCount?: number;
  onSyncNow?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  unsyncedCount = 0,
  onSyncNow,
}) => {
  const isOnline = useOnlineStatus();

  if (isOnline && unsyncedCount === 0) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="hidden sm:inline">En línea</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!isOnline ? (
        <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-amber-200 bg-amber-950/80 border border-amber-600/70 rounded-lg shadow-sm animate-pulse">
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Modo Sin Conexión (Offline)</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
          <Wifi className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Conectado</span>
        </div>
      )}

      {unsyncedCount > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-200 bg-sky-950/70 border border-sky-700/60 rounded-lg">
          <span>{unsyncedCount} pendientes</span>
          {onSyncNow && isOnline && (
            <button
              onClick={onSyncNow}
              className="p-0.5 hover:text-white transition"
              title="Sincronizar ahora"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
