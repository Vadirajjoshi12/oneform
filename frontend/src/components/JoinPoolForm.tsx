import React, { memo, useState } from 'react';
import { PoolItem } from '../types';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

interface JoinPoolFormProps {
  poolId: string;
  onJoinPool?: (
    poolId: string,
    name: string,
    phone: string,
    itemName: string,
    price: number
  ) => Promise<void>;
  onAddItemToPool: (
    poolId: string,
    item: Omit<PoolItem, 'id'>
  ) => void;
  onAddChatMessage?: (
    poolId: string,
    message: {
      id: string;
      sender: string;
      text: string;
      time: string;
      isHost?: boolean;
    }
  ) => void;
  onUserNameChange?: (name: string) => void;
}

export const JoinPoolForm = memo(function JoinPoolForm({
  poolId,
  onJoinPool,
  onAddItemToPool,
  onAddChatMessage,
  onUserNameChange,
}: JoinPoolFormProps) {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleUserNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setUserName(value);

    // Important:
    // Update parent's ref only.
    // This does NOT cause the parent modal to re-render.
    onUserNameChange?.(value);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    if (
      !userName.trim() ||
      !userPhone.trim() ||
      !itemName.trim() ||
      !itemPrice ||
      Number(itemPrice) <= 0
    ) {
      setJoinError(
        'Please fill in your name, phone number, item name, and item price.'
      );
      return;
    }

    const priceNum = Number(itemPrice);

    if (onJoinPool) {
      setIsJoining(true);

      try {
        await onJoinPool(
          poolId,
          userName.trim(),
          userPhone.trim(),
          itemName.trim(),
          priceNum
        );

        const joinedItemName = itemName.trim();

        setItemName('');
        setItemPrice('');
        setNotes('');

        if (onAddChatMessage) {
          onAddChatMessage(poolId, {
            id: `chat-${Date.now()}`,
            sender: userName.trim(),
            text: `Joined pool with "${joinedItemName}" (₹${priceNum})!`,
            time: 'Just now',
          });
        }
      } catch (err: any) {
        setJoinError(
          err?.message || 'Failed to join pool'
        );
      } finally {
        setIsJoining(false);
      }
    } else {
      const avatarSeed = userName
        .trim()
        .replace(/\s+/g, '');

      onAddItemToPool(poolId, {
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

  return (
    <form
      onSubmit={handleAddItem}
      className="bg-[#f5f5f7] p-4 rounded-2xl border border-black/[0.04] space-y-3"
    >
      <div className="text-xs font-bold text-[#1d1d1f] flex items-center justify-between">
        <span>Join Pool / Add Your Item</span>

        <span className="text-[10px] text-slate-500 font-normal">
          Requires Phone Number
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          required
          placeholder="Your name *"
          value={userName}
          onChange={handleUserNameChange}
          className="bg-white border border-black/[0.06] focus:border-black/30 rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
        />

        <input
          type="tel"
          required
          placeholder="Phone number * (e.g. 9876543210)"
          value={userPhone}
          onChange={(e) => setUserPhone(e.target.value)}
          className="bg-white border border-black/[0.06] focus:border-black/30 rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          required
          placeholder="Item name *"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="sm:col-span-2 bg-white border border-black/[0.06] focus:border-black/30 rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
        />

        <div className="relative">
          <span className="absolute left-3 top-2 text-slate-400 text-xs">
            ₹
          </span>

          <input
            type="number"
            min="1"
            required
            placeholder="Price *"
            value={itemPrice}
            onChange={(e) =>
              setItemPrice(
                e.target.value === ''
                  ? ''
                  : Number(e.target.value)
              )
            }
            className="w-full pl-6 bg-white border border-black/[0.06] focus:border-black/30 rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Notes for host (optional e.g. preference, size)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-grow bg-white border border-black/[0.06] focus:border-black/30 rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isJoining}
          className="bg-[#1d1d1f] hover:bg-black disabled:bg-slate-400 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-colors"
        >
          {isJoining ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          )}

          <span>
            {isJoining ? 'Joining...' : 'Join Pool'}
          </span>
        </button>
      </div>

      {joinError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{joinError}</span>
        </div>
      )}
    </form>
  );
});