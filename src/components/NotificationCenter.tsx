import React from 'react';
import { Bell, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { SystemNotification } from '../types';
import { formatDate } from '../utils';

interface NotificationCenterProps {
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onClearAll
}: NotificationCenterProps) {
  return (
    <div className="space-y-6 text-[#F0F6FC]">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#1F6FEB] uppercase font-bold">SYSTEM TELEMETRY & AUDITING</span>
          <h2 className="font-display font-bold text-2xl tracking-tight text-white mt-1">Notification Center</h2>
        </div>
        <button 
          onClick={onClearAll}
          disabled={notifications.length === 0}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-lg text-xs font-mono font-bold text-gray-300 transition-colors"
        >
          Clear Broadcast History
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {notifications.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-xl border border-gray-800 space-y-3">
            <Bell className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="font-display font-semibold text-sm text-gray-400">Zero System Interferences</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Ledger streams are pristine. No validation lag, network consensus delays, or signature mismatches reported.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`
                  p-4 rounded-xl border flex items-start gap-4 transition-all duration-300 relative cursor-pointer group
                  ${n.read ? 'bg-[#0D1117]/30 border-gray-800' : 'bg-[#1F6FEB]/5 border-[#1F6FEB]/30 glowing-blue'}
                `}
              >
                {/* Dynamic Type Icon */}
                <div className={`p-2 rounded-lg border shrink-0 mt-0.5
                  ${n.type === 'SUCCESS' ? 'bg-[#2EA043]/10 border-[#2EA043]/20 text-[#2EA043]' :
                    n.type === 'WARNING' ? 'bg-[#D29922]/10 border-[#D29922]/20 text-[#D29922]' :
                    n.type === 'ERROR' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    'bg-[#1F6FEB]/10 border-[#1F6FEB]/20 text-[#1F6FEB]'}
                `}>
                  {n.type === 'SUCCESS' && <CheckCircle className="w-4 h-4" />}
                  {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4" />}
                  {n.type === 'ERROR' && <ShieldAlert className="w-4 h-4" />}
                  {n.type === 'INFO' && <Bell className="w-4 h-4" />}
                </div>

                <div className="space-y-1 overflow-hidden pr-8">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#1F6FEB] transition-colors">{n.title}</h4>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 bg-[#1F6FEB] rounded-full glowing-blue shrink-0 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                  
                  <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 pt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(n.timestamp)}</span>
                    {n.blockNumber && (
                      <span className="text-[#1F6FEB] font-bold">Ledger Target: Block #{n.blockNumber}</span>
                    )}
                  </div>
                </div>

                {!n.read && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(n.id);
                    }}
                    className="absolute right-4 top-4 text-[10px] font-mono text-[#1F6FEB] hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
