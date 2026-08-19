import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { OrderPool, PoolItem, DeliveryStatus, ChatMessage } from '../types';
import { PLATFORMS } from '../data/mockData';
import { JoinPoolForm } from './JoinPoolForm';
import {
  X,
  Plus,
  Trash2,
  MapPin,
  QrCode,
  Send,
  Copy,
  Check,
  Lock,
  Unlock,
  ShieldCheck,
  MessageSquare,
  Key,
  CheckSquare,
  XSquare,
  AlertCircle,
  Loader2,
  ShoppingBag,
  LogOut,
  Phone,
} from 'lucide-react';

interface PoolDetailModalProps {
  pool: OrderPool | null;
  onClose: () => void;
  onAddItemToPool: (poolId: string, item: Omit<PoolItem, 'id'>) => void;
  onRemoveItemFromPool: (poolId: string, itemId: string) => void;
  onJoinPool?: (poolId: string, name: string, phone: string, itemName: string, price: number) => Promise<void>;
  onLeavePool?: (poolId: string, phone: string) => Promise<void>;
  onCancelPool?: (poolId: string, phone: string) => Promise<void>;
  onPlaceOrder?: (poolId: string, phone: string) => Promise<void>;
  onUpdateDeliveryStatus?: (poolId: string, status: DeliveryStatus) => void;
  onToggleItemPaid?: (poolId: string, itemId: string) => void;
  onAddChatMessage?: (poolId: string, message: ChatMessage) => void;
  onRefreshPoolDetails?: (poolId: string) => Promise<void>;
}

const DELIVERY_STAGES: Array<{ status: DeliveryStatus; icon: string; label: string }> = [
  { status: 'Cart Open', icon: '🟢', label: 'Cart Open' },
  { status: 'Target Reached', icon: '🎯', label: 'Target Reached' },
  { status: 'Order Placed', icon: '🛒', label: 'Order Placed' },
  { status: 'Preparing', icon: '🍳', label: 'Preparing' },
  { status: 'Out for Delivery', icon: '🛵', label: 'Out for Delivery' },
  { status: 'Delivered', icon: '✅', label: 'Delivered' },
];

export const PoolDetailModal: React.FC<PoolDetailModalProps> = ({
  pool,
  onClose,
  onAddItemToPool,
  onRemoveItemFromPool,
  onJoinPool,
  onLeavePool,
  onCancelPool,
  onPlaceOrder,
  onUpdateDeliveryStatus,
  onToggleItemPaid,
  onAddChatMessage,
  onRefreshPoolDetails,
}) => {



  // Host PIN security & unlocks
  const [isHostUnlocked, setIsHostUnlocked] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Host actions
  const [hostActionLoading, setHostActionLoading] = useState<boolean>(false);
  const [hostActionError, setHostActionError] = useState<string | null>(null);

  // Chat message input
  const [newChatMessage, setNewChatMessage] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // Keep the open pool synchronized without hammering the API.
  // Polling is paused when the tab is hidden so background tabs don't consume requests.
  useEffect(() => {
    if (!pool?.id || !onRefreshPoolDetails) return;

    let cancelled = false;

    const refresh = async () => {
      if (cancelled || document.visibilityState !== 'visible') return;

      try {
        await onRefreshPoolDetails(pool.id);
      } catch (err) {
        console.warn('Live pool sync failed:', err);
      }
    };

    refresh();
    const intervalId = window.setInterval(refresh, 3000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pool?.id, onRefreshPoolDetails]);

if (!pool) return null;

console.log("POOL DEBUG:", {
  id: pool.id,
  currentAmount: pool.currentAmount,
  targetThreshold: pool.targetThreshold,
  remainingAmount: pool.remainingAmount,
  status: pool.status,
});

const platform =
  PLATFORMS.find((p) => p.id === pool.platform) || PLATFORMS[0];

const percentage = Math.min(
  Math.round((pool.currentAmount / pool.targetThreshold) * 100),
  100
);

const remaining =
  pool.remainingAmount !== undefined
    ? pool.remainingAmount
    : Math.max(
        pool.targetThreshold - pool.currentAmount,
        0
      );

  // Financial calculations
  const totalPooledAmount = pool.currentAmount || pool.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalPaidAmount = pool.items.filter((i) => i.hasPaid).reduce((sum, i) => sum + i.price * i.quantity, 0);
  const savedDeliveryFee = platform.defaultDeliveryFee;

  const currentStatusIndex = DELIVERY_STAGES.findIndex((s) => s.status === (pool.deliveryStatus || 'Cart Open'));

  // Handle Host PIN Verification
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = pool.hostPin || '1234';
    if (pinInput.trim() === correctPin) {
      setIsHostUnlocked(true);
      setShowPinModal(false);
      setPinError(null);
      setPinInput('');
    } else {
      setPinError('Incorrect Host Security PIN. Please try again.');
    }
  };


  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    const senderName = isHostUnlocked
      ? `${pool.hostName} (Host)`
      : userName.trim() || 'Neighbor';

    if (onAddChatMessage) {
      onAddChatMessage(pool.id, {
        id: `chat-${Date.now()}`,
        sender: senderName,
        text: newChatMessage.trim(),
        time: 'Just now',
        isHost: isHostUnlocked,
      });
    }

    setNewChatMessage('');
  };

  const copyUpiId = () => {
    const upiId = `${(pool.hostPhone || '9876543210').replace(/\D/g, '')}@upi`;
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-black/[0.08] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 text-[#1d1d1f] max-h-[92vh] flex flex-col relative">
        
        {/* Header */}
        <div className="p-5 border-b border-black/[0.06] flex items-center justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#1d1d1f] uppercase tracking-tight">
                {pool.platform} POOL #{pool.id.slice(-4)}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                Host: {pool.hostName}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#1d1d1f] flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{pool.pickupLocation}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isHostUnlocked) setIsHostUnlocked(false);
                else setShowPinModal(true);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                isHostUnlocked
                  ? 'bg-amber-500/10 text-amber-900 border-amber-500/30'
                  : 'bg-black/[0.04] hover:bg-black/10 text-slate-800 border-black/[0.08]'
              }`}
            >
              {isHostUnlocked ? <><Unlock className="w-3.5 h-3.5 text-amber-600" /><span>Unlocked</span></> : <><Lock className="w-3.5 h-3.5 text-slate-500" /><span>🔐 Controls</span></>}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow">
          <div className="bg-[#f5f5f7] p-4.5 rounded-2xl border border-black/[0.04] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Delivery Milestone</span>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 flex items-center gap-1.5"><span>{DELIVERY_STAGES[currentStatusIndex >= 0 ? currentStatusIndex : 0].icon}</span><span>{pool.deliveryStatus || 'Cart Open'}</span></span>
            </div>
            <div className="grid grid-cols-6 gap-1 pt-1">
              {DELIVERY_STAGES.map((stage, idx) => {
                const isPassed = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                return <div key={stage.status} className="flex flex-col items-center gap-1 text-center"><div className={`w-full h-1.5 rounded-full transition-all duration-300 ${isCurrent ? 'bg-emerald-600 shadow-xs' : isPassed ? 'bg-emerald-500/60' : 'bg-slate-200'}`} /><span className={`text-[9px] font-bold truncate max-w-full ${isCurrent ? 'text-emerald-900' : isPassed ? 'text-slate-700' : 'text-slate-400'}`}>{stage.label}</span></div>;
              })}
            </div>
            <p className="text-[11px] text-slate-500 italic text-center pt-0.5">Only host <strong>({pool.hostName})</strong> can update order milestones.</p>
          </div>

          {isHostUnlocked && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/15 pb-2"><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-700" /><span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">Host Panel</span></div><span className="text-[10px] font-bold text-amber-800 bg-amber-500/10 px-2 py-0.5 rounded-md">Authenticated</span></div>
              <div className="space-y-2"><span className="text-xs font-bold text-slate-700 block">Backend Host Actions:</span><div className="flex flex-wrap gap-2">
                <button type="button" disabled={hostActionLoading || pool.status === 'cancelled' || pool.status === 'expired'} onClick={async () => { const hostPhoneNum = pool.hostPhone || localStorage.getItem(`oneform_host_phone_${pool.id}`) || ''; if (!hostPhoneNum) { alert('Host phone number is required.'); return; } setHostActionLoading(true); setHostActionError(null); try { if (onPlaceOrder) await onPlaceOrder(pool.id, hostPhoneNum); } catch (err: any) { setHostActionError(err.message || 'Failed to place order'); } finally { setHostActionLoading(false); } }} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">{hostActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShoppingBag className="w-3.5 h-3.5" />}<span>Place Order (POST /order)</span></button>
                <button type="button" disabled={hostActionLoading || pool.status === 'cancelled' || pool.status === 'expired'} onClick={async () => { const hostPhoneNum = pool.hostPhone || localStorage.getItem(`oneform_host_phone_${pool.id}`) || ''; if (!hostPhoneNum) { alert('Host phone number is required.'); return; } if (!confirm('Are you sure you want to cancel this order pool?')) return; setHostActionLoading(true); setHostActionError(null); try { if (onCancelPool) await onCancelPool(pool.id, hostPhoneNum); } catch (err: any) { setHostActionError(err.message || 'Failed to cancel pool'); } finally { setHostActionLoading(false); } }} className="bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">{hostActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XSquare className="w-3.5 h-3.5" />}<span>Cancel Pool (POST /cancel)</span></button>
              </div>{hostActionError && <div className="text-xs text-rose-600 font-semibold mt-1">Error: {hostActionError}</div>}</div>

              <div className="space-y-2 pt-2 border-t border-amber-500/15"><span className="text-xs font-bold text-slate-700 block">Update Order Delivery Milestone:</span><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{DELIVERY_STAGES.map((stage) => { const isSelected = (pool.deliveryStatus || 'Cart Open') === stage.status; return <button key={stage.status} type="button" onClick={() => { if (onUpdateDeliveryStatus) onUpdateDeliveryStatus(pool.id, stage.status); }} className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 justify-center ${isSelected ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'}`}><span>{stage.icon}</span><span>{stage.label}</span></button>; })}</div></div>

              <div className="space-y-2 pt-1 border-t border-amber-500/15"><div className="flex justify-between items-center text-xs font-bold text-slate-800"><span>Participant Payment Tracker</span><span className="text-emerald-800 font-extrabold">Collected: ₹{totalPaidAmount} / ₹{totalPooledAmount}</span></div><div className="space-y-1.5 max-h-40 overflow-y-auto">{pool.items.map((item) => <div key={item.id} className="bg-white p-2.5 rounded-xl border border-black/[0.06] flex items-center justify-between text-xs"><div className="flex items-center gap-2"><img src={item.addedByAvatar} alt={item.addedBy} className="w-6 h-6 rounded-full bg-slate-100" /><div><span className="font-semibold text-slate-800">{item.addedBy}</span><span className="text-slate-500 ml-1">({item.itemName} - ₹{item.price * item.quantity})</span></div></div><button type="button" onClick={() => { if (onToggleItemPaid) onToggleItemPaid(pool.id, item.id); }} className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${item.hasPaid ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'}`}>{item.hasPaid ? <><CheckSquare className="w-3 h-3 text-emerald-700" /><span>Paid 🟢</span></> : <><XSquare className="w-3 h-3 text-rose-700" /><span>Unpaid 🔴</span></>}</button></div>)}</div></div>
            </div>
          )}

          <div className="bg-[#f5f5f7] p-4 rounded-2xl border border-black/[0.04] space-y-2"><div className="flex justify-between items-center text-xs font-semibold"><span className="text-slate-600">Cart Total: <span className="text-[#1d1d1f] font-extrabold text-sm">₹{totalPooledAmount}</span> / ₹{pool.targetThreshold}</span><span className={percentage >= 100 ? 'text-emerald-700 font-bold' : 'text-slate-700'}>{percentage >= 100 ? 'Free Delivery Unlocked 🎉' : `Need ₹${remaining} more`}</span></div><div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-300 ${percentage >= 100 ? 'bg-emerald-600' : 'bg-[#1d1d1f]'}`} style={{ width: `${percentage}%` }} /></div><div className="flex justify-between text-[11px] text-slate-500 font-medium pt-0.5"><span>Host Phone: <strong>{pool.hostPhone || '+91 98765 43210'}</strong></span><span className="text-emerald-700 font-semibold">Saves ₹{savedDeliveryFee} delivery fee</span></div></div>

          <JoinPoolForm
  poolId={pool.id}
  onJoinPool={onJoinPool}
  onAddItemToPool={onAddItemToPool}
  onAddChatMessage={onAddChatMessage}
/>

          <div className="space-y-2"><h4 className="text-xs font-semibold text-slate-500">Cart Items ({pool.items.length})</h4><div className="space-y-2">{pool.items.map((item) => <div key={item.id} className="bg-white p-3 rounded-2xl border border-black/[0.06] flex items-center justify-between text-xs shadow-2xs"><div className="flex items-center gap-2.5"><img src={item.addedByAvatar} alt={item.addedBy} className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 shrink-0" /><div><div className="font-semibold text-[#1d1d1f] flex items-center gap-1.5"><span>{item.itemName}</span>{item.isHost && <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">Host</span>}<span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${item.hasPaid ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200'}`}>{item.hasPaid ? 'Paid 🟢' : 'Unpaid 🔴'}</span></div><div className="text-[11px] text-slate-500">Added by <strong>{item.addedBy.replace(/\s*\(Host\)/gi, '')}</strong>{item.notes && <span className="italic ml-1">({item.notes})</span>}</div></div></div><div className="flex items-center gap-3"><span className="font-extrabold text-[#1d1d1f] text-xs">₹{item.price * item.quantity}</span>{!item.isHost && <div className="flex items-center gap-1.5">{onLeavePool && <button type="button" onClick={() => { const targetPhone = prompt(`Enter phone number for ${item.addedBy} to leave pool:`, item.memberPhone || userPhone || ''); if (targetPhone && targetPhone.trim()) onLeavePool(pool.id, targetPhone.trim()).catch((err) => alert(err.message || 'Failed to leave pool')); }} className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition-colors flex items-center gap-1" title="Leave Pool (POST /leave)"><LogOut className="w-3 h-3" /><span>Leave</span></button>}<button type="button" onClick={() => onRemoveItemFromPool(pool.id, item.id)} className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-colors" title="Remove item"><Trash2 className="w-3.5 h-3.5" /></button></div>}</div></div>)}</div></div>

          <div className="bg-[#f5f5f7] p-4 rounded-2xl border border-black/[0.04] space-y-3"><div className="flex items-center justify-between border-b border-black/[0.06] pb-2"><div><span className="text-xs font-bold text-[#1d1d1f] block">Reimburse Host ({pool.hostName})</span><span className="text-[11px] text-slate-500">Pay your exact item share via UPI</span></div><QrCode className="w-4 h-4 text-slate-600" /></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center"><div className="bg-white p-2.5 rounded-xl border border-black/[0.06] space-y-0.5"><span className="text-[10px] text-slate-400 font-medium">UPI ID</span><div className="flex items-center justify-between gap-2"><span className="font-mono text-xs font-semibold text-[#1d1d1f]">{(pool.hostPhone || '9876543210').replace(/\D/g, '') || '9876543210'}@upi</span><button type="button" onClick={copyUpiId} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors font-medium">{copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}<span>{copiedUpi ? 'Copied' : 'Copy'}</span></button></div></div><div className="grid grid-cols-2 gap-2 text-xs font-medium"><a href={`upi://pay?pa=${(pool.hostPhone || '9876543210').replace(/\D/g, '') || '9876543210'}@upi&pn=${encodeURIComponent(pool.hostName)}&cu=INR`} className="bg-[#1d1d1f] hover:bg-black text-white py-2 rounded-xl text-center font-bold transition-colors">Pay via UPI</a><button type="button" onClick={() => alert(`Marked payment request sent to host ${pool.hostName}!`)} className="bg-white hover:bg-slate-100 text-slate-800 py-2 rounded-xl text-center border border-black/[0.06] transition-colors font-medium">I've Paid</button></div></div></div>

          <div className="bg-[#f5f5f7] p-4 rounded-2xl border border-black/[0.04] space-y-3"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-slate-500" />Real-Time In-Pool Chat & Updates</span><span className="text-[10px] text-slate-400 font-medium">{(pool.messages || []).length} messages</span></div><div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-1">{(pool.messages || []).length > 0 ? pool.messages?.map((msg) => <div key={msg.id} className={`text-xs p-2.5 rounded-xl border space-y-0.5 ${msg.isHost ? 'bg-amber-500/10 border-amber-500/20 text-slate-900' : 'bg-white border-black/[0.04] text-slate-800'}`}><div className="flex justify-between text-[10px] font-medium text-slate-500"><span className="font-bold text-[#1d1d1f] flex items-center gap-1">{msg.sender}{msg.isHost && <span className="bg-amber-200 text-amber-900 px-1 py-0.2 rounded text-[9px]">Host</span>}</span><span>{msg.time}</span></div><p className="text-slate-800">{msg.text}</p></div>) : <p className="text-xs text-slate-400 italic text-center py-2">No messages yet. Send a message to coordinate with neighbors!</p>}</div><form onSubmit={handleSendChat} className="flex gap-2"><input type="text" placeholder={isHostUnlocked ? 'Post as Host...' : 'Message host or pool members...'} value={newChatMessage} onChange={(e) => setNewChatMessage(e.target.value)} className="flex-grow bg-white border border-black/[0.06] focus:border-black/30 rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none" /><button type="submit" className="bg-[#1d1d1f] hover:bg-black text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"><Send className="w-3.5 h-3.5" /><span>Send</span></button></form></div>
        </div>

        {showPinModal && <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-black/10 shadow-2xl space-y-4 text-center"><div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto"><Key className="w-5 h-5" /></div><div><h4 className="text-base font-bold text-[#1d1d1f]">Host Controls Access</h4><p className="text-xs text-slate-500 mt-1">Enter host PIN for <strong>{pool.hostName}</strong> to unlock milestone and payment controls.</p></div><form onSubmit={handleVerifyPin} className="space-y-3"><input type="password" maxLength={6} autoFocus placeholder="Enter Host PIN (Default: 1234)" value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full text-center bg-slate-100 border border-slate-200 focus:border-black/30 rounded-xl px-3 py-2.5 text-sm font-mono tracking-widest text-[#1d1d1f] focus:outline-none" />{pinError && <p className="text-xs text-rose-600 font-medium flex items-center justify-center gap-1"><AlertCircle className="w-3.5 h-3.5" /><span>{pinError}</span></p>}<div className="grid grid-cols-2 gap-2 pt-1"><button type="button" onClick={() => { setShowPinModal(false); setPinError(null); setPinInput(''); }} className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl transition-colors">Cancel</button><button type="submit" className="bg-[#1d1d1f] hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl transition-colors">Unlock</button></div></form></div></div>}
      </div>
    </div>
  );
};
