export type QuickCommercePlatform = 'Blinkit' | 'Zepto' | 'Instamart' | 'Swiggy' | 'Swiggy Instamart' | 'Amazon Now' | 'Flipkart Minutes' | 'BigBasket Now' | 'Amazon Fresh';

export type PoolStatus = 'active' | 'threshold_met' | 'expired' | 'cancelled' | 'completed';

export type DeliveryStatus =
  | 'Cart Open'
  | 'Target Reached'
  | 'Order Placed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Expired'
  | 'Cart Locked'
  | 'Arrived at Gate'
  | 'Completed';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isHost?: boolean;
}

export interface PlatformConfig {
  id: QuickCommercePlatform;
  name: string;
  color: string; // Tailwind hex or class color
  bgLight: string;
  badgeBg: string;
  textColor: string;
  defaultDeliveryFee: number;
  handlingFee: number;
  freeDeliveryThreshold: number;
  logoIcon: string; // Lucide icon or emoji / icon name
}

export interface PoolItem {
  id: string;
  addedBy: string;
  addedByAvatar: string;
  itemName: string;
  price: number;
  quantity: number;
  isHost: boolean;
  notes?: string;
  hasPaid?: boolean;
  memberPhone?: string;
  memberId?: string;
}

export interface BackendMemberItem {
  id?: string;
  itemName: string;
  quantity: number;
  price: number;
}

export interface BackendMember {
  id?: string;
  name: string;
  phone?: string;
  isHost: boolean;
  cartTotal: number;
  items: BackendMemberItem[];
  joinedAt?: string;
}

export interface BackendPoolData {
  id: string;
  communityId?: string;
  platform: string;
  pickupLocation: string;
  targetThreshold?: number;
  memberCount: number;
  poolTotal: number;
  remainingAmount: number;
  timeLeftMinutes: number;
  status: PoolStatus;
  deliveryStatus: DeliveryStatus;
  note?: string;
  members?: BackendMember[];
  hostToken?: string;
}

export interface OrderPool {
  id: string;
  communityId: string;
  communityName: string;
  hostName: string;
  hostPhone: string;
  hostAvatar: string;
  platform: QuickCommercePlatform;
  pickupLocation: string; // e.g. "Hostel 4 Main Gate Reception"
  targetThreshold: number;
  currentAmount: number;
  remainingAmount?: number;
  memberCount?: number;
  timeLeftMinutes?: number;
  expiresAt: string; // ISO timestamp or remaining minutes
  status: PoolStatus;
  deliveryStatus?: DeliveryStatus;
  hostPin?: string;
  hostToken?: string;
  items: PoolItem[];
  members?: BackendMember[];
  messages?: ChatMessage[];
  createdAt: string;
  note?: string;
}

export interface CreatePoolPayload {
  communityId: string;
  platform: string;
  pickupLocation: string;
  radiusKm?: number;
  durationMinutes: number;
  targetThreshold: number;
  note?: string;
  host: {
    name: string;
    phone: string;
  };
  item: {
    name: string;
    price: number;
    quantity: number;
  };
  location: {
    lat: number;
    lng: number;
  };
}

export interface JoinPoolPayload {
  name: string;
  phone: string;
  items: Array<{
    itemName: string;
    price: number;
    quantity: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  hostToken?: string;
  count?: number;
  data: T;
}

export interface Community {
  id: string;
  name: string;
  type: 'Hostel' | 'PG' | 'Apartment Complex' | 'College Campus' | 'Tech Park';
  location: string;
  lat: number;
  lng: number;
  radiusKm?: number; // Maximum allowed distance to create/join pools (default 2.0 km)
  memberCount: number;
  totalSaved: number;
  activePoolsCount: number;
  image: string;
}

export interface UserLocationState {
  coords: { lat: number; lng: number } | null;
  status: 'idle' | 'locating' | 'granted' | 'denied' | 'unsupported';
  error: string | null;
  accuracy?: number; // accuracy in meters
  updatedAt?: number;
  isSimulated?: boolean;
}

export interface FeedbackComment {
  id: string;
  authorName: string;
  authorRole: string; // e.g. "Hostel 7 Resident", "PG Owner - Koramangala"
  avatar: string;
  comment: string;
  upvotes: number;
  hasUpvoted?: boolean;
  createdAt: string;
  location: string;
  replyFromFounder?: string;
}
