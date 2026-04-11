import { PRODUCT_IMAGES } from './images'

export const CATEGORIES = [
  {
    name: 'All Categories',
    slug: 'all',
    children: [],
  },
  {
    name: 'Servers',
    slug: 'servers',
    children: [
      'Dell Power Edge 10,20,30,40 Servers',
      'HP ProLiant 10, 20, 30, 40.. Servers',
      'HitArchi Servers',
      'Lenovo Servers',
    ],
  },
]

export const SUB_NAV_TABS = [
  'Servers',
  'Server Systems',
  'Storage',
  'Accessories',
  'Featured products',
]

export const CPU_TYPES = [
  { label: 'Full All Intel Xeon Processors', count: 0, checked: true },
  { label: 'AMD Opteron 8000', count: 0, checked: false },
  { label: 'Intel Xeon 5600 Processor', count: 0, checked: false },
  { label: 'Intel Xeon 5400 Series processor', count: 0, checked: false },
  { label: 'Intel Xeon E5-2600', count: 4, checked: false },
  { label: 'Intel Xeon E5-2600v', count: 4, checked: false },
]

export const BRANDS = [
  { label: 'Dell', count: 26, checked: false },
  { label: 'HP', count: 6, checked: false },
]

export const PROCESSORS = [
  { label: 'Intel', count: 26, checked: false },
  { label: 'AMD', count: 6, checked: false },
  { label: 'Apple', count: 0, checked: false },
  { label: 'HP', count: 6, checked: false },
]

export const MAX_MEMORY = [
  { label: '16 to', count: 26, checked: false },
  { label: '32 to', count: 6, checked: false },
  { label: '8 to', count: 6, checked: false },
]

export const POWER_SUPPLY = [
  { label: 'Dual', checked: false },
  { label: 'Single', checked: false },
]

export const SORT_OPTIONS = [
  { value: 'default', label: 'Sort by default' },
  { value: 'popularity', label: 'Sort by Popularity' },
  { value: 'rating', label: 'Sort by Average Rating' },
  { value: 'price-low', label: 'Sort by Price: low to high' },
  { value: 'price-high', label: 'Sort by Price: high to low' },
  { value: 'newest', label: 'Sort by Recently Added' },
]

export const BANNER_SLIDES = [
  {
    id: 1,
    image: PRODUCT_IMAGES.dellR730xd,
    tag: 'Limited Offer',
    heading: 'Save big on servers for your\nbusiness',
    subtext: 'Save 20% off on all servers with annual subscription annual package',
  },
]

export const TOTAL_PRODUCTS = 688
export const PRODUCTS_PER_PAGE = 16
export const TOTAL_PAGES = Math.ceil(TOTAL_PRODUCTS / PRODUCTS_PER_PAGE)

const SERVER_IMG = PRODUCT_IMAGES.poweredgeT30

export const SAMPLE_PRODUCTS = Array.from({ length: PRODUCTS_PER_PAGE }, (_, i) => ({
  id: i + 1,
  name: ['PowerEdge T30 Mini Tower Server', 'Inspiron 24 5000 All-In-One Desktop', 'Dell PowerEdge R730xd Rack Server', 'HP ProLiant DL380 Gen10 Server', 'Dell Latitude 3420 Laptop', 'Lenovo ThinkStation P340 Workstation', 'HP EliteDesk 800 G6 Desktop', 'Dell OptiPlex 7090 Tower'][i % 8],
  slug: `product-${i + 1}`,
  price: [3000, 5000, 12000, 8000, 15000, 3000, 5000, 3000][i % 8],
  price_per_month: [3000, 5000, 12000, 8000, 15000, 3000, 5000, 3000][i % 8],
  category: ['Servers', 'Desktops', 'Servers', 'Servers', 'Laptops', 'Workstations', 'Desktops', 'Desktops'][i % 8],
  brand: ['Dell', 'Dell', 'Dell', 'HP', 'Dell', 'Lenovo', 'HP', 'Dell'][i % 8],
  image: SERVER_IMG,
  image_url: SERVER_IMG,
  description: 'Competitive Price, Long-Lasting, High Quality, Ultra-Flexible Wire, Easy to Install, Hi power Rating Complaint, Pluggable On Other Units, Promotes Better, Active Quick Shipping.',
}))

export const MOCK_CATEGORIES = [
  { id: 1, name: 'Servers', children: [{ id: 11, name: 'Tower Servers' }, { id: 12, name: 'Rack Servers' }] },
  { id: 2, name: 'Desktops', children: [{ id: 21, name: 'All-In-One' }, { id: 22, name: 'Mini Tower' }] },
  { id: 3, name: 'Laptops', children: [{ id: 31, name: 'Business Laptops' }, { id: 32, name: 'Workstation Laptops' }] },
  { id: 4, name: 'Workstations', children: [] },
  { id: 5, name: 'Accessories', children: [] },
  { id: 6, name: 'Storage', children: [] },
  { id: 7, name: 'Network', children: [] },
]

export const MOCK_BRANDS = ['Dell', 'HP', 'Lenovo', 'Cisco', 'IBM']
