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
  let json: any = null;
  try { json = await res.json(); } catch {
    throw new Error(res.ok ? 'The server returned an invalid response. Please try again.' : `Server error (${res.status}). Please try again.`);
  }
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || json?.error || `Request failed with status ${res.status}`);
  }
  return json as T;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    return await handleResponse<T>(await fetch(url, options));
  } catch (error: any) {
    if (error instanceof TypeError) throw new Error('Unable to connect to 1FORM server. Please check your internet connection or try again in a moment.');
    throw error;
  }
}

export function mapBackendPoolToOrderPool(backendData: BackendPoolData, communityName?: string, existingLocalPool?: OrderPool | null): OrderPool {
  const hostMember = backendData.members?.find((m) => m.isHost);
  const hostName = hostMember?.name || existingLocalPool?.hostName || 'Host';
  const hostPhone = hostMember?.phone || existingLocalPool?.hostPhone || '';
  const avatarSeed = hostName.trim().replace(/\s+/g, '');
  const items: PoolItem[] = [];
  if (backendData.members && backendData.members.length > 0) {
    backendData.members.forEach((m) => {
      const memberAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.name.trim().replace(/\s+/g, ''))}`;
      (m.items || []).forEach((item, idx) => items.push({ id: item.id || `item-${m.id || m.name}-${idx}`, addedBy: m.name, addedByAvatar: memberAvatar, itemName: item.itemName, price: item.price, quantity: item.quantity || 1, isHost: m.isHost, hasPaid: true, memberPhone: m.phone, memberId: m.id }));
    });
  } else if (existingLocalPool?.items) items.push(...existingLocalPool.items);

  const poolTotal = backendData.poolTotal ?? existingLocalPool?.currentAmount ?? 0;
  const targetThreshold = backendData.targetThreshold ?? existingLocalPool?.targetThreshold ?? 0;
  const remainingAmount = backendData.remainingAmount ?? Math.max(targetThreshold - poolTotal, 0);
  let rawPlatform = (backendData.platform || existingLocalPool?.platform || 'Zepto') as QuickCommercePlatform;
  if ((rawPlatform as string) === 'Instamart' || (rawPlatform as string) === 'Swiggy') rawPlatform = 'Swiggy Instamart';

  return {
    id: backendData.id,
    communityId: backendData.communityId || existingLocalPool?.communityId || 'gat-hostel',
    communityName: communityName || existingLocalPool?.communityName || 'GAT Hostel & Hub',
    hostName, hostPhone,
    hostAvatar: existingLocalPool?.hostAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
    platform: rawPlatform,
    pickupLocation: backendData.pickupLocation || existingLocalPool?.pickupLocation || 'Main Gate',
    targetThreshold, currentAmount: poolTotal, remainingAmount,
    memberCount: backendData.memberCount ?? backendData.members?.length ?? 1,
    timeLeftMinutes: backendData.timeLeftMinutes ?? 30,
    expiresAt: backendData.expiresAt || existingLocalPool?.expiresAt || new Date(Date.now() + (backendData.timeLeftMinutes || 30) * 60000).toISOString(),
    status: backendData.status || 'active', deliveryStatus: backendData.deliveryStatus || 'Cart Open',
    hostPin: existingLocalPool?.hostPin || '1234', hostToken: backendData.hostToken || existingLocalPool?.hostToken || '',
    items, members: backendData.members || existingLocalPool?.members || [],
    messages: existingLocalPool?.messages || [{ id: `msg-${Date.now()}`, sender: hostName, text: `Order pool active for ${rawPlatform}! Drop-off at ${backendData.pickupLocation}`, time: 'Just now', isHost: true }],
    createdAt: existingLocalPool?.createdAt || new Date().toISOString(), note: backendData.note || existingLocalPool?.note || '',
  };
}

export async function createPool(payload: CreatePoolPayload): Promise<ApiResponse<BackendPoolData>> {
  return request<ApiResponse<BackendPoolData>>(`${API_BASE_URL}/api/pools/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

// GPS can jitter by a few metres between browser updates. Using 3 decimal places
// for the cache key (~100m) prevents those tiny changes from causing a new API call.
const nearbyRequestCache = new Map<string, { promise: Promise<ApiResponse<BackendPoolData[]>>; timestamp: number }>();
const NEARBY_REQUEST_CACHE_MS = 8000;

export async function getNearbyPools(lat: number, lng: number, radius = 2): Promise<ApiResponse<BackendPoolData[]>> {
  const roundedLat = Number(lat.toFixed(3));
  const roundedLng = Number(lng.toFixed(3));
  const key = `${roundedLat}:${roundedLng}:${radius}`;
  const cached = nearbyRequestCache.get(key);
  if (cached && Date.now() - cached.timestamp < NEARBY_REQUEST_CACHE_MS) return cached.promise;

  const promise = request<ApiResponse<BackendPoolData[]>>(`${API_BASE_URL}/api/pools/nearby?lat=${roundedLat}&lng=${roundedLng}&radius=${radius}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  nearbyRequestCache.set(key, { promise, timestamp: Date.now() });
  try { return await promise; } catch (error) { if (nearbyRequestCache.get(key)?.promise === promise) nearbyRequestCache.delete(key); throw error; }
}

const poolDetailsCache = new Map<string, { promise: Promise<ApiResponse<BackendPoolData>>; timestamp: number }>();
const POOL_DETAILS_CACHE_MS = 8000;

export async function getPoolDetails(poolId: string): Promise<ApiResponse<BackendPoolData>> {
  const cached = poolDetailsCache.get(poolId);
  if (cached && Date.now() - cached.timestamp < POOL_DETAILS_CACHE_MS) return cached.promise;

  const promise = request<ApiResponse<BackendPoolData>>(`${API_BASE_URL}/api/pools/${poolId}`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  poolDetailsCache.set(poolId, { promise, timestamp: Date.now() });
  try { return await promise; } catch (error) { if (poolDetailsCache.get(poolId)?.promise === promise) poolDetailsCache.delete(poolId); throw error; }
}

function invalidatePoolDetailsCache(poolId: string) { poolDetailsCache.delete(poolId); }

export async function joinPool(poolId: string, payload: JoinPoolPayload): Promise<ApiResponse<BackendPoolData>> {
  const result = await request<ApiResponse<BackendPoolData>>(`${API_BASE_URL}/api/pools/${poolId}/join`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  invalidatePoolDetailsCache(poolId); return result;
}

export async function leavePool(poolId: string, phone: string): Promise<ApiResponse<BackendPoolData>> {
  const result = await request<ApiResponse<BackendPoolData>>(`${API_BASE_URL}/api/pools/${poolId}/leave`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
  invalidatePoolDetailsCache(poolId); return result;
}

function getHostAuthHeaders(poolId: string): Record<string, string> {
  const token = localStorage.getItem(`oneform_host_token_${poolId}`);
  if (!token) throw new Error('Host authorization is missing. Please reopen the pool you created.');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

export async function cancelPool(poolId: string, phone: string): Promise<ApiResponse<BackendPoolData>> {
  const result = await request<ApiResponse<BackendPoolData>>(`${API_BASE_URL}/api/pools/${poolId}/cancel`, { method: 'POST', headers: getHostAuthHeaders(poolId), body: JSON.stringify({ phone }) });
  invalidatePoolDetailsCache(poolId); return result;
}

export async function placeOrder(poolId: string, phone: string): Promise<ApiResponse<BackendPoolData>> {
  const result = await request<ApiResponse<BackendPoolData>>(`${API_BASE_URL}/api/pools/${poolId}/order`, { method: 'POST', headers: getHostAuthHeaders(poolId), body: JSON.stringify({ phone }) });
  invalidatePoolDetailsCache(poolId); return result;
}

export async function updateDeliveryStatus(poolId: string, phone: string, deliveryStatus: string): Promise<ApiResponse> {
  const result = await request<ApiResponse>(`${API_BASE_URL}/api/pools/${poolId}/delivery-status`, { method: 'POST', headers: getHostAuthHeaders(poolId), body: JSON.stringify({ phone, deliveryStatus }) });
  invalidatePoolDetailsCache(poolId); return result;
}
