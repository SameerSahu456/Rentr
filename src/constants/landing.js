import { CATEGORY_IMAGES, PRODUCT_IMAGES, BRAND_IMAGES } from './images'

export const PRODUCT_TABS = ['Products', 'Featured products', 'Build your own', 'Brands']

export const CATEGORIES = [
  { name: 'Chasis', image: CATEGORY_IMAGES.chasis, color: '#e8e0f7' },
  { name: 'Desktops', image: CATEGORY_IMAGES.desktops, color: '#d4edda' },
  { name: 'Laptops', image: CATEGORY_IMAGES.laptops, color: '#fff3cd' },
  { name: 'Server', image: CATEGORY_IMAGES.server, color: '#d1ecf1' },
  { name: 'Network', image: CATEGORY_IMAGES.network, color: '#f8d7da' },
  { name: 'Harddisk', image: CATEGORY_IMAGES.harddisk, color: '#e2d6f3' },
  { name: 'Accessories', image: CATEGORY_IMAGES.accessories, color: '#fde2c8' },
]

export const BEST_SELLERS = [
  { id: 1, name: 'PowerEdge T30 Mini Tower Server', price: '3,000', slug: 'poweredge-t30', image: PRODUCT_IMAGES.poweredgeT30 },
  { id: 2, name: 'Inspiron 24 5000 All-In-One Desktop', price: '12,000', slug: 'inspiron-24', image: PRODUCT_IMAGES.inspiron245000 },
  { id: 3, name: 'Inspiron 24 5000 All-In-One Desktop', price: '22,000', slug: 'inspiron-24-2', image: PRODUCT_IMAGES.poweredgeT30 },
  { id: 4, name: 'Dell PowerEdge R730xd (12 bay) Rack Server', price: '33,000', slug: 'dell-r730xd', image: PRODUCT_IMAGES.dellR730xd },
  { id: 5, name: 'PowerEdge T30 Mini Tower Server', price: '19,000', slug: 'poweredge-t30-5', image: PRODUCT_IMAGES.poweredgeT30 },
  { id: 6, name: 'PowerEdge T30 Mini Tower Server', price: '1,000', slug: 'poweredge-t30-6', image: PRODUCT_IMAGES.poweredgeT30 },
]

export const EDUCATION_PRODUCTS = [
  { id: 7, name: 'Dell Latitude 3420 Laptop', price: '3,200', slug: 'edu-1', image: PRODUCT_IMAGES.poweredgeT30 },
  { id: 8, name: 'PowerEdge T30 Mini Tower Server', price: '4,150', slug: 'edu-2', image: PRODUCT_IMAGES.poweredgeT30 },
  { id: 9, name: 'Inspiron 24 5000 Desktop', price: '6,800', slug: 'edu-3', image: PRODUCT_IMAGES.inspiron245000 },
  { id: 10, name: 'ProLiant DL380 Gen10 Server', price: '8,500', slug: 'edu-4', image: PRODUCT_IMAGES.dellR730xd },
  { id: 11, name: 'Dell Latitude 5540 Laptop', price: '5,500', slug: 'edu-5', image: PRODUCT_IMAGES.poweredgeT30 },
  { id: 12, name: 'PowerEdge R740 Rack Server', price: '12,000', slug: 'edu-6', image: PRODUCT_IMAGES.dellR730xd },
]

export const BRAND_PARTNERS = [
  // Row 1 (5 logos)
  { name: 'Accenture', logo: BRAND_IMAGES.accenture },
  { name: 'Cognizant', logo: BRAND_IMAGES.cognizant },
  { name: 'HDFC Bank', logo: BRAND_IMAGES.hdfcBank },
  { name: 'Accenture 2', logo: BRAND_IMAGES.accenture },
  { name: 'Cognizant 2', logo: BRAND_IMAGES.cognizant },
  // Row 2 (4 logos)
  { name: 'Accenture 3', logo: BRAND_IMAGES.accenture },
  { name: 'Cognizant 3', logo: BRAND_IMAGES.cognizant },
  { name: 'HDFC Bank 2', logo: BRAND_IMAGES.hdfcBank },
  { name: 'Accenture 4', logo: BRAND_IMAGES.accenture },
]
