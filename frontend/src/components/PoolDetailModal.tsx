import React, { useState, useEffect } from 'react';
import { OrderPool, PoolItem, DeliveryStatus, ChatMessage } from '../types';
import { PLATFORMS } from '../data/mockData';
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
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [itemPrice, setItemPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState<string>('');

  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

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

    // Refresh immediately when the modal opens.
    refresh();

    // 8 seconds keeps the second device reasonably fresh while avoiding
    // continuous network activity and unnecessary React re-renders.
    const intervalId = window.setInterval(refresh, 8000);

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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    if (!userName.trim() || !userPhone.trim() || !itemName.trim() || !itemPrice || Number(itemPrice) <= 0) {
      alert('Please fill in your name, phone number, item name, and item price.');
      return;
    }

    const priceNum = Number(itemPrice);

    if (onJoinPool) {
      setIsJoining(true);
      try {
        await onJoinPool(pool.id, userName.trim(), userPhone.trim(), itemName.trim(), priceNum);
        setItemName('');
        setItemPrice('');
        setNotes('');

        if (onAddChatMessage) {
          onAddChatMessage(pool.id, {
            id: `chat-${Date.now()}`,
            sender: userName.trim(),
            text: `Joined pool with "${itemName.trim()}" (₹${priceNum})!`,
            time: 'Just now',
          });
        }
      } catch (err: any) {
        setJoinError(err.message || 'Failed to join pool');
      } finally {
        setIsJoining(false);
      }
    } else {
      // Fallback
      const avatarSeed = userName.trim().replace(/\s+/g, '');
      onAddItemToPool(pool.id, {
        addedBy: userName.trim(),
        addedByAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
        itemName: itemName.trim(),
        price: priceNum,
        quantity: 1,
        isHost: false,
        notes: notes.trim(),
        hasPaid: false,
        memberPhone: userPhone.trim(),
      });
      setItemName('');
      setItemPrice('');
      setNotes('');
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
            <h3 className="text-base sm:text-lg font-bold text-[#1d1d1d] flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{pool.pickupLocation}</span>
            </h3>
          </div>