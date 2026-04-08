import { PRODUCT_IMAGES } from './images'
import {
  FileText,
  User,
  MapPin,
  ShoppingCart,
  Truck,
  ShieldCheck,
  ClipboardList,
  CreditCard,
  Building2,
  Globe,
  Wallet,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Customer Checkout Constants                                        */
/* ------------------------------------------------------------------ */

export const CUSTOMER_TOP_STEPS = [
  { key: 'checkout', label: 'Check out' },
  { key: 'delivery', label: 'Delivery Details' },
  { key: 'verification', label: 'Verification' },
  { key: 'summary', label: 'Order Summary' },
  { key: 'payment', label: 'Complete payment' },
]

export const CUSTOMER_SECTION_STEPS = [
  { number: 1, label: 'Order Details', icon: FileText },
  { number: 2, label: 'Verify your Profile', icon: User },
  { number: 3, label: 'Delivery Address & Reference', icon: MapPin },
]

export const CUSTOMER_INITIAL_CART = [
  {
    id: 1,
    name: 'Dell Server DL 380',
    price: 65000,
    qty: 3,
    category: 'Products Rent',
  },
  {
    id: 2,
    name: 'Server Rack 42U',
    price: 3092,
    qty: 1,
    category: 'Addons Rent',
  },
  {
    id: 3,
    name: 'UPS 10KVA Online',
    price: 2500,
    qty: 1,
    category: 'Addons Rent',
  },
]

/* ------------------------------------------------------------------ */
/*  Distributor Checkout Constants                                     */
/* ------------------------------------------------------------------ */

export const DISTRIBUTOR_STEPS = [
  { key: 'order', label: 'Check out', icon: ShoppingCart },
  { key: 'delivery', label: 'Delivery Details', icon: Truck },
  { key: 'verification', label: 'Verification', icon: ShieldCheck },
  { key: 'summary', label: 'Order Summary', icon: ClipboardList },
  { key: 'payment', label: 'Complete payment', icon: CreditCard },
]

export const DISTRIBUTOR_INITIAL_CART = [
  {
    id: 1,
    image: PRODUCT_IMAGES.poweredgeT30,
    name: 'Dell Server DL 380',
    specs: 'Intel Xeon Gold, 128 GB RAM, 2 TB SSD',
    category: 'Server Rent',
    monthlyRent: 22149,
    addonsRent: 1316,
    retailPrice: 38500,
    pricePerMonth: 49000,
    qty: 2,
    tenure: '24 months',
    deliveryDate: '7th August, 2021',
    subItems: [
      { label: 'Form Factor', value: 'Rack' },
      { label: 'DIMM Slots', value: '24' },
      { label: 'Max Memory', value: '768 GB' },
    ],
  },
  {
    id: 2,
    image: PRODUCT_IMAGES.inspiron245000,
    name: 'Server Rack 42U',
    specs: '42U Standard Rack, Cable management, PDU',
    category: 'Infrastructure Rent',
    monthlyRent: 3092,
    addonsRent: 0,
    retailPrice: 3500,
    pricePerMonth: 3092,
    qty: 1,
    tenure: '12 months',
    deliveryDate: '7th August, 2021',
    subItems: [
      { label: 'Height', value: '42U' },
      { label: 'Type', value: 'Standard' },
    ],
  },
  {
    id: 3,
    image: PRODUCT_IMAGES.poweredgeT30,
    name: 'APC Smart-UPS 3000VA',
    specs: 'Online UPS, LCD, Extended Runtime',
    category: 'Power Rent',
    monthlyRent: 3650,
    addonsRent: 200,
    retailPrice: 4200,
    pricePerMonth: 3650,
    qty: 1,
    tenure: '12 months',
    deliveryDate: '7th August, 2021',
    subItems: [
      { label: 'Type', value: 'Online' },
      { label: 'Display', value: 'LCD' },
    ],
  },
]

export const PAYMENT_METHODS = [
  { key: 'card', label: 'Credit/Debit Card', icon: CreditCard },
  { key: 'netbanking', label: 'Netbanking', icon: Building2 },
  { key: 'upi', label: 'UPI', icon: Globe },
  { key: 'wallets', label: 'Wallets', icon: Wallet },
]
