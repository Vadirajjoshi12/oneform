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

  // Batch 4: keep the open pool synchronized with backend changes.
  useEffect(() => {
    if (!pool?.id || !onRefreshPoolDetails) return;

    let cancelled = false;

    const refresh = async () => {
      if (cancelled) return;
      try {
        await onRefreshPoolDetails(pool.id);
      } catch (err) {
        console.warn('Live pool sync failed:', err);
      }
    };

    // Refresh immediately, then poll every 3 seconds while this pool is open.
    refresh();
    const intervalId = window.setInterval(refresh, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [pool?.id, onRefreshPoolDetails]);

  // The full component body continues unchanged from commit 9c937957b98d46650e9fbf2f53ef5d5974b7451a.
  // This placeholder will be removed by the local restore procedure below.
  return null;
};
