import { PlatformConfig, OrderPool, Community, FeedbackComment } from '../types';

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'Blinkit',
    name: 'Blinkit',
    color: '#F9C200',
    bgLight: '#FFFBE6',
    badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    textColor: 'text-yellow-800',
    defaultDeliveryFee: 35,
    handlingFee: 10,
    freeDeliveryThreshold: 199,
    logoIcon: 'ShoppingBag',
  },
  {
    id: 'Zepto',
    name: 'Zepto',
    color: '#7F27FF',
    bgLight: '#F5EEFF',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    textColor: 'text-purple-800',
    defaultDeliveryFee: 40,
    handlingFee: 9,
    freeDeliveryThreshold: 149,
    logoIcon: 'Zap',
  },
  {
    id: 'Swiggy Instamart',
    name: 'Swiggy Instamart',
    color: '#FC8019',
    bgLight: '#FFF5EC',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
    textColor: 'text-orange-800',
    defaultDeliveryFee: 49,
    handlingFee: 12,
    freeDeliveryThreshold: 199,
    logoIcon: 'Store',
  },
  {
    id: 'Amazon Now',
    name: 'Amazon Now',
    color: '#232F3E',
    bgLight: '#F2F4F8',
    badgeBg: 'bg-slate-100 text-slate-900 border-slate-300',
    textColor: 'text-slate-800',
    defaultDeliveryFee: 35,
    handlingFee: 8,
    freeDeliveryThreshold: 299,
    logoIcon: 'ShoppingBag',
  },
  {
    id: 'Flipkart Minutes',
    name: 'Flipkart Minutes',
    color: '#2874F0',
    bgLight: '#EFF5FF',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    textColor: 'text-blue-800',
    defaultDeliveryFee: 30,
    handlingFee: 5,
    freeDeliveryThreshold: 199,
    logoIcon: 'Zap',
  },
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-my-location',
    name: 'Your location',
    type: 'Hostel',
    location: 'Current Physical Location',
    lat: 12.9345,
    lng: 77.6264,
    radiusKm: 1.5,
    memberCount: 218,
    totalSaved: 12450,
    activePoolsCount: 3,
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&auto=format&fit=crop&q=60',
  },
];

// Quick suggestion items for quick commerce additions
export const COMMON_QUICK_ITEMS = [
  { name: 'Maggi 2-Minute Noodles (Pack of 4)', price: 56, category: 'Snacks' },
  { name: 'Amul Taaza Toned Milk 500ml', price: 27, category: 'Dairy' },
  { name: 'Red Bull Energy Drink 250ml', price: 125, category: 'Beverages' },
  { name: 'Lays Magic Masala Crisp 50g', price: 20, category: 'Snacks' },
  { name: 'Thums Up 750ml Bottle', price: 40, category: 'Beverages' },
  { name: 'Britannia Good Day Biscuits 100g', price: 30, category: 'Snacks' },
  { name: 'Amul Butter 100g', price: 58, category: 'Dairy' },
  { name: 'Cadbury Dairy Milk Silk 60g', price: 90, category: 'Sweets' },
  { name: 'Paper Boat Coconut Water 200ml', price: 50, category: 'Beverages' },
  { name: 'Doritos Nacho Cheese 60g', price: 35, category: 'Snacks' },
];

// Helper to generate futuristic timestamps
const now = new Date();
const getMinutesFromNow = (mins: number) => new Date(now.getTime() + mins * 60000).toISOString();

export const INITIAL_POOLS: OrderPool[] = [];

export const INITIAL_COMMENTS: FeedbackComment[] = [
  {
    id: 'c-1',
    authorName: 'Yashavant CK',
    authorRole: 'Co-Founder @ 1FORM',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yashavant',
    comment: "Hey everyone! Vadiraj and I are building 1FORM in public to crush unfair delivery fees in hostels and PG communities. Drop your thoughts, pain points, or platform requests below! 🚀",
    upvotes: 48,
    hasUpvoted: true,
    createdAt: '2 hours ago',
    location: 'Bengaluru',
  },
  {
    id: 'c-2',
    authorName: 'Vadiraj Joshi',
    authorRole: 'Co-Founder @ 1FORM',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vadiraj',
    comment: "Did you know in a 500-student hostel, students pay over ₹35,000 every month in duplicate delivery charges for items under ₹50? One simple form changes everything.",
    upvotes: 39,
    hasUpvoted: true,
    createdAt: '1 hour ago',
    location: 'Bengaluru',
  },
  {
    id: 'c-3',
    authorName: 'Kavya Madhavan',
    authorRole: 'Hostel 9 Resident, NITK',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya',
    comment: "This is literally my daily struggle. Yesterday I needed a ₹20 notebook and paid ₹49 delivery + ₹10 small order charge on Zepto! 1FORM is a total gamechanger.",
    upvotes: 27,
    hasUpvoted: false,
    createdAt: '45 mins ago',
    location: 'Surathkal',
    replyFromFounder: "Glad it resonates Kavya! We're rolling out automatic UPI split QR codes next so host reimbursement takes 2 seconds.",
  },
  {
    id: 'c-4',
    authorName: 'Tanmay Bhattacharya',
    authorRole: 'Zolo Stays PG Manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanmay',
    comment: "As a PG warden, having 30 delivery drivers pull up outside the gate every hour is chaos. Combining orders into 1 batch delivery saves traffic at the gate too!",
    upvotes: 19,
    hasUpvoted: false,
    createdAt: '20 mins ago',
    location: 'Koramangala',
  },
];
