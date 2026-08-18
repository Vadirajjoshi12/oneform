import {
  BackendPoolData,
  CreatePoolPayload,
  JoinPoolPayload,
  OrderPool,
  PoolItem,
  QuickCommercePlatform,
  ApiResponse,
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://oneform-2.onrender.com';

async function handleResponse<T>(res: Response): Promise<T> {
  let json: any;
  try {
    json = await res.json();
  } catch (err) {
    throw new Error(`Network response error (${res.status} ${res.statusText})`);
  }

  if (!res.ok || json.success === false) {
    const errorMsg = json.message || json.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return json as T;
}

export function mapBackendPoolToOrderPool(
  backendData: BackendPoolData,
  communityName?: string,
  existingLocalPool?: OrderPool | null
): OrderPool {
  const hostMember = backendData.members?.find((m) => m.isHost);
  const hostName = hostMember?.name || existingLocalPool?.hostName || 'Host';
  const hostPhone = hostMember?.phone || existingLocalPool?.hostPhone || '';
  const avatarSeed = hostName.trim().replace(/\s+/g, '');

  const items: PoolItem[] = [];
  if (backendData.members && backendData.members.length > 0) {
    backendData.members.forEach((m) => {
      const memberAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name.trim().replace(/\s+/g, ''))}`;
      (m.items || []).forEach((item, idx) => {
        items.push({
          id: item.id || `item-${m.id || m.name}-${idx}`,
          addedBy: m.name,
          addedByAvatar: memberAvatar,
          itemName: item.itemName,
          price: item.price,
          quantity: item.quantity || 1,
          isHost: m.isHost,
          hasPaid: true,
          memberPhone: m.phone,
          memberId: m.id,
        });
      });
    });
  } else if (existingLocalPool?.items) {
    items.push(...existingLocalPool.items);
  }

  const poolTotal = backendData.poolTotal ?? existingLocalPool?.currentAmount ?? 0;
  const targetThreshold =
  backendData.targetThreshold ??
  existingLocalPool?.targetThreshold ??
  0;
  const remainingAmount = backendData.remainingAmount ?? Math.max(targetThreshold - poolTotal, 0);

  let rawPlatform = (backendData.platform || existingLocalPool?.platform || 'Zepto') as QuickCommercePlatform;
  if ((rawPlatform as string) === 'Instamart' || (rawPlatform as string) === 'Swiggy') {
    rawPlatform = 'Swiggy Instamart';
  }

  return {
    id: backendData.id,
    communityId: backendData.communityId || existingLocalPool?.communityId || 'gat-hostel',
    communityName: communityName || existingLocalPool?.communityName || 'GAT Hostel & Hub',
    hostName,
    hostPhone,
    hostAvatar: existingLocalPool?.hostAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
    platform: rawPlatform,
    pickupLocation: backendData.pickupLocation || existingLocalPool?.pickupLocation || 'Main Gate',
    targetThreshold,
    currentAmount: poolTotal,
    remainingAmount,
    memberCount: backendData.memberCount ?? backendData.members?.length ?? 1,
    timeLeftMinutes: backendData.timeLeftMinutes ?? 30,
    expiresAt: existingLocalPool?.expiresAt || new Date(Date.now() + (backendData.timeLeftMinutes || 30) * 60000).toISOString(),
    status: backendData.status || 'active',
    deliveryStatus: backendData.deliveryStatus || 'Cart Open',
    hostPin: existingLocalPool?.hostPin || '1234',
    hostToken: backendData.hostToken || existingLocalPool?.hostToken || '',
    items,
    members: backendData.members || existingLocalPool?.members || [],
    messages: existingLocalPool?.messages || [
      {
        id: `msg-${Date.now()}`,
        sender: hostName,
        text: `Order pool active for ${rawPlatform}! Drop-off at ${backendData.pickupLocation}`,
        time: 'Just now',
        isHost: true,
      },
    ],
    createdAt: existingLocalPool?.createdAt || new Date().toISOString(),
    note: backendData.note || existingLocalPool?.note || '',
  };
}

export async function createPool(payload: CreatePoolPayload): Promise<ApiResponse<BackendPoolData>> {
  const response = await fetch(`${API_BASE_URL}/api/pools/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<ApiResponse<BackendPoolData>>(response);
}

export async function getNearbyPools(lat: number, lng: number, radius = 2): Promise<ApiResponse<BackendPoolData[]>> {
  const url = `${API_BASE_URL}/api/pools/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<ApiResponse<BackendPoolData[]>>(response);
}

export async function getPoolDetails(poolId: string): Promise<ApiResponse<BackendPoolData>> {
  const response = await fetch(`${API_BASE_URL}/api/pools/${poolId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<ApiResponse<BackendPoolData>>(response);
}

export async function joinPool(poolId: string, payload: JoinPoolPayload): Promise<ApiResponse<BackendPoolData>> {
  const response = await fetch(`${API_BASE_URL}/api/pools/${poolId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<ApiResponse<BackendPoolData>>(response);
}

export async function leavePool(poolId: string, phone: string): Promise<ApiResponse<BackendPoolData>> {
  const response = await fetch(`${API_BASE_URL}/api/pools/${poolId}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return handleResponse<ApiResponse<BackendPoolData>>(response);
}

export async function cancelPool(poolId: string, phone: string): Promise<ApiResponse<BackendPoolData>> {
  const response = await fetch(`${API_BASE_URL}/api/pools/${poolId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return handleResponse<ApiResponse<BackendPoolData>>(response);
}

export async function placeOrder(poolId: string, phone: string): Promise<ApiResponse<BackendPoolData>> {
  const response = await fetch(`${API_BASE_URL}/api/pools/${poolId}/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return handleResponse<ApiResponse<BackendPoolData>>(response);
}
export async function updateDeliveryStatus(
  poolId: string,
  phone: string,
  deliveryStatus: string
): Promise<ApiResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/pools/${poolId}/delivery-status`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        deliveryStatus,
      }),
    }
  );

  return handleResponse<ApiResponse>(response);
}
