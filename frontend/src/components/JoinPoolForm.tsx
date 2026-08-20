import React, { memo, useRef, useState } from 'react';

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
}

export const JoinPoolForm = memo(function JoinPoolForm({
  poolId,
  onJoinPool,
  onAddItemToPool,
  onAddChatMessage,
}: JoinPoolFormProps) {
  /*
   * IMPORTANT:
   * Keep these as refs instead of React state.
   * This prevents re-rendering on every keystroke.
   */
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const itemNameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLInputElement>(null);

  const [isJoining, setIsJoining] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    itemName?: string;
    price?: string;
  }>({});

  const [joinError, setJoinError] = useState<string | null>(null);

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;

      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    setJoinError(null);
    setFieldErrors({});

    const userName = nameRef.current?.value.trim() || '';
    const userPhone = phoneRef.current?.value.trim() || '';
    const itemName = itemNameRef.current?.value.trim() || '';
    const priceText = priceRef.current?.value || '';
    const notes = notesRef.current?.value.trim() || '';

    const price = Number(priceText);

    const errors: {
      name?: string;
      phone?: string;
      itemName?: string;
      price?: string;
    } = {};

    // Name validation
    if (!userName) {
      errors.name = 'Name is required.';
    }

    // Phone validation
    if (!userPhone) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(userPhone)) {
      errors.phone =
        'Enter a valid 10-digit Indian mobile number starting with 6–9.';
    }

    // Item validation
    if (!itemName) {
      errors.itemName = 'Item name is required.';
    }

    // Price validation
    if (!priceText) {
      errors.price = 'Price is required.';
    } else if (!Number.isFinite(price) || price <= 0) {
      errors.price = 'Price must be greater than ₹0.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (onJoinPool) {
      setIsJoining(true);

      try {
        await onJoinPool(
          poolId,
          userName,
          userPhone,
          itemName,
          price
        );

        /*
         * Clear only after successful join.
         */
        if (itemNameRef.current) {
          itemNameRef.current.value = '';
        }

        if (priceRef.current) {
          priceRef.current.value = '';
        }

        if (notesRef.current) {
          notesRef.current.value = '';
        }

        if (onAddChatMessage) {
          onAddChatMessage(poolId, {
            id: `chat-${Date.now()}`,
            sender: userName,
            text: `Joined pool with "${itemName}" (₹${price})!`,
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
      const avatarSeed = userName.replace(/\s+/g, '');

      onAddItemToPool(poolId, {
        addedBy: userName,

        addedByAvatar:
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,

        itemName,
        price,
        quantity: 1,
        isHost: false,
        notes,
        hasPaid: false,
        memberPhone: userPhone,
      });

      if (itemNameRef.current) {
        itemNameRef.current.value = '';
      }

      if (priceRef.current) {
        priceRef.current.value = '';
      }

      if (notesRef.current) {
        notesRef.current.value = '';
      }
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

      {/* Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <input
            ref={nameRef}
            type="text"
            required
            placeholder="Your name *"
            onInput={() => clearFieldError('name')}
            className={`w-full bg-white border ${
              fieldErrors.name
                ? 'border-rose-400 focus:border-rose-500'
                : 'border-black/[0.06] focus:border-black/30'
            } rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none`}
          />

          {fieldErrors.name && (
            <p className="mt-1 text-[11px] text-rose-600 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <input
            ref={phoneRef}
            type="tel"
            required
            inputMode="numeric"
            maxLength={10}
            placeholder="Phone number *"
            onInput={(e) => {
              const input = e.currentTarget;
              const digitsOnly = input.value
                .replace(/\D/g, '')
                .slice(0, 10);

              if (input.value !== digitsOnly) {
                input.value = digitsOnly;
              }

              clearFieldError('phone');
            }}
            className={`w-full bg-white border ${
              fieldErrors.phone
                ? 'border-rose-400 focus:border-rose-500'
                : 'border-black/[0.06] focus:border-black/30'
            } rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none`}
          />

          {fieldErrors.phone && (
            <p className="mt-1 text-[11px] text-rose-600 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              {fieldErrors.phone}
            </p>
          )}
        </div>
      </div>

      {/* Item + Price */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2">
          <input
            ref={itemNameRef}
            type="text"
            required
            placeholder="Item name *"
            onInput={() => clearFieldError('itemName')}
            className={`w-full bg-white border ${
              fieldErrors.itemName
                ? 'border-rose-400 focus:border-rose-500'
                : 'border-black/[0.06] focus:border-black/30'
            } rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none`}
          />

          {fieldErrors.itemName && (
            <p className="mt-1 text-[11px] text-rose-600 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              {fieldErrors.itemName}
            </p>
          )}
        </div>

        <div>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 text-xs">
              ₹
            </span>

            <input
              ref={priceRef}
              type="number"
              min="1"
              step="1"
              required
              inputMode="decimal"
              placeholder="Price *"
              onInput={() => clearFieldError('price')}
              className={`w-full pl-6 bg-white border ${
                fieldErrors.price
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-black/[0.06] focus:border-black/30'
              } rounded-xl px-3 py-2 text-xs text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none`}
            />
          </div>

          {fieldErrors.price && (
            <p className="mt-1 text-[11px] text-rose-600 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              {fieldErrors.price}
            </p>
          )}
        </div>
      </div>

      {/* Notes + Submit */}
      <div className="flex gap-2">
        <input
          ref={notesRef}
          type="text"
          placeholder="Notes for host (optional e.g. preference, size)"
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

      {/* Backend / unexpected error */}
      {joinError && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{joinError}</span>
        </div>
      )}
    </form>
  );
});