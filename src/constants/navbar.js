import { PRODUCT_IMAGES } from './images'

export const CITIES = ['Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Kolkata']

export const SUGGESTIONS = ['Laptops', 'Servers', 'Desktops', 'Chasis', 'Storage', 'Network']

export const CURATED_CATEGORIES = [
  { name: 'Custom HP servers', icon: 'package' },
  { name: 'HP laptops', icon: 'package' },
]

export const MOCK_SEARCH_HISTORY = [
  { name: 'Dell PowerEdge R730xd', image: PRODUCT_IMAGES.poweredgeT30 },
  { name: 'PowerEdge T30 Mini Tower Server', image: PRODUCT_IMAGES.dellR730xd },
  { name: 'PowerEdge T30 Mini Tower Server', image: PRODUCT_IMAGES.inspiron245000 },
]

export const AUTOCOMPLETE_DATA = {
  text: ['Servers', 'Server accessories', 'Server parts', 'Server chasis'],
  products: [
    { name: 'HP servers', icon: 'package' },
    { name: 'Dell servers', icon: 'package' },
  ]
}

export const MOCK_CART_ITEMS = [
  { id: 1, name: 'Dell PowerEdge R730xd', image: PRODUCT_IMAGES.poweredgeT30, tenure: '24 Months', rent: '42,000' },
  { id: 2, name: 'PowerEdge T30 Mini Tower Server', image: PRODUCT_IMAGES.dellR730xd, tenure: '24 Months', rent: '42,000' },
]
