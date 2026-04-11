import { PRODUCT_IMAGES, AVATAR_IMAGES } from './images'

const SERVER_IMG = PRODUCT_IMAGES.poweredgeT30
const SERVER_IMG2 = PRODUCT_IMAGES.inspiron245000
const SERVER_IMG3 = PRODUCT_IMAGES.poweredgeT30
const SERVER_IMG4 = PRODUCT_IMAGES.dellR730xd
const SERVER_IMG5 = PRODUCT_IMAGES.poweredgeT30

export { SERVER_IMG }

export const PRODUCT = {
  name: 'Dell Server DL 380',
  brand: 'HPE',
  productCode: '868709-B21',
  category: 'Server',
  parentCategory: 'Products',
  images: [SERVER_IMG, SERVER_IMG2, SERVER_IMG3, SERVER_IMG4, SERVER_IMG5],
  pricePerMonth: 42000,
  description:
    'The HPE ProLiant DL380 Gen10 server delivers the latest in security, performance and expandability. Run everything from the most basic to mission critical.',
  sizeAndDimensions: '44.55 x 73.03 x 8.74 cm',
  features: [
    'Intel Xeon Scalable processor support',
    'Up to 3TB DDR4-2666 memory',
    'Flexible storage with up to 30 SFF or 19 LFF drives',
    'HPE iLO 5 with Intelligent Provisioning',
  ],
  weight: '14.76 kg',
  whatsNew:
    'New Intel Xeon Scalable processors, HPE Persistent Memory, and 12 Gb/s SAS for increased performance. Supports HPE Smart Array. Supports all new features like iLO Federation peer to peer mass deployment.',
  monthlyRentalApprox: 42000,
  totalApprox: 504000,
  model: 'Basic server, Model:',
}

export const SERVER_DETAILS = [
  { label: 'RAM', value: '768GB DDR3 Memory' },
  { label: 'CPU', value: 'Intel Xeon E5-2600 Processor Family' },
  { label: 'Form Factor', value: '2U Rack Server' },
  { label: 'Memory Slots', value: '24 DIMMs' },
  { label: 'Storage space', value: '50 TB max' },
]

export const ITEM_DETAILS = [
  { label: 'Item group', value: '8 SFFs Gen 4 (3.84 TB) 1F Servers / T8' },
  { label: 'Brand', value: 'Dell' },
  { label: 'Asset name', value: 'Standard HPE' },
  { label: 'SKU', value: 'Dell' },
  { label: 'Processor', value: 'Intel Xeon E5-2600 v4 (12Core/45 Core/1066MHz/E5)' },
  { label: 'Memory', value: 'HP 8GB DDR4' },
  { label: 'Hard Drive', value: 'HP 1TB SAS 7.2K LFF (2x1TB) (R11)' },
  { label: 'SSD', value: '480 GB M.2 SATA SSD (x1)/0 Solid State LF' },
]

export const SPEC_TABLE = [
  { label: 'Processor', value: 'Intel Xeon Scalable 7351 (36-core, 17 vPro, 1AB, DDR5)' },
  { label: 'Expansion slots', value: '5 PCI 3.0 for detailed description reference the QuickSpec' },
  { label: 'Form factor', value: 'Rack (2U)' },
  { label: 'Installed hard drives', value: 'Holds ship standard, 8 HT drives supported' },
  { label: 'Infrastructure management', value: 'HPE iLO (Included with Intelligent Provisioning, Eav-Activated, HPE OneView Standard, (optional) Advanced, HPE iLO Advanced, HPE iLO Advanced Premium Security (Edition) and HPE OneView Advanced (optional)' },
  { label: 'Maximum memory', value: '12 TB, memory supported final differs by processor selection' },
  { label: 'Memory slots', value: '24 DIMM slots' },
  { label: 'Memory type', value: 'HPE DDR4 SmartMemory' },
  { label: 'Memory, standard', value: '16 GB (1x 16 GB =) RDIMM' },
  { label: 'Minimum dimensions (Hx W x D)', value: '16 GB (1x 16 GB =) RDIMM' },
]

export const SIMILAR_PRODUCTS = [
  { id: 1, name: 'PowerEdge T30 Mini Tower Server', price: 3000, image: SERVER_IMG, slug: 'poweredge-t30' },
  { id: 2, name: 'Inspiron 24 5000 All-In-One Desktop', price: 12000, image: SERVER_IMG2, slug: 'inspiron-24-5000' },
  { id: 3, name: 'Inspiron 24 5000 All-In-One Desktop', price: 22000, image: SERVER_IMG3, slug: 'inspiron-24-5000-2' },
  { id: 4, name: 'Dell PowerEdge R730xd (12 bay) Rack Server', price: 33000, image: SERVER_IMG4, slug: 'dell-r730xd' },
  { id: 5, name: 'PowerEdge T30 Mini Tower Server', price: 19000, image: SERVER_IMG, slug: 'poweredge-t30-2' },
  { id: 6, name: 'PowerEdge Server', price: 1000, image: SERVER_IMG5, slug: 'poweredge-server' },
]

export const TESTIMONIALS = [
  {
    name: 'Benny Blanco',
    text: 'I am something else/someone commercial through the interior, but Interior is from the office renting for a decent renting Service. I got inspired by Rashi Manga Customer. I asked our Client which hung with 2 and registering to Multistorey Customer.',
    avatar: AVATAR_IMAGES.avatar1,
  },
  {
    name: 'Benny Blanco',
    text: 'I am a small business, my name which I think is about Indian to Office of Client renting Service. I got inspired by Multistorey Customer. I asked our client sitting hung high ringing to Multistorey Customer.',
    avatar: AVATAR_IMAGES.avatar2,
  },
  {
    name: 'Benny Blanco',
    text: 'I am something else/someone commercial through the interior, but Interior is from the office renting for a decent renting Service. I got inspired by Rashi Manga Customer. I asked our Client which hung with 2 and to Multistorey & Customer.',
    avatar: AVATAR_IMAGES.avatar3,
  },
]

export const FAQ_ITEMS = [
  {
    question: 'When does the product need to be serviced? Will servicing be charged additionally?',
    answer: 'The product will be serviced as per the maintenance schedule. Basic servicing is included in the rental cost. Any additional repairs or replacements due to mishandling may be charged extra.',
  },
  {
    question: 'How many months warranty does the product come with?',
    answer: 'Every product comes with a 6-month warranty from the date of delivery. Extended warranty options are available at additional cost.',
  },
  {
    question: 'Why are rentals changing with tenure?',
    answer: 'Longer tenures receive discounted monthly rates as it provides stability and reduces operational overhead for both parties.',
  },
  {
    question: 'How many part does the server comprise of?',
    answer: 'The server comprises multiple components including the chassis, processors, memory modules, storage drives, power supply units, and network interface cards.',
  },
  {
    question: 'When does the product need to be serviced? Will servicing be charged additionally?',
    answer: 'Regular servicing is part of our rental agreement. We conduct preventive maintenance to ensure optimal performance.',
  },
  {
    question: 'Is the RAM build-in?',
    answer: 'Yes, the RAM comes pre-installed in the server. You can request additional RAM modules through our Build Your Own feature.',
  },
]

export const BYO_CATEGORIES = [
  {
    id: 'ram', label: 'RAM', options: [
      { id: 'ram-8', name: '8GB DDR4-2933 ECC', price: 350 },
      { id: 'ram-16', name: '16GB DDR4-2933 ECC', price: 600 },
      { id: 'ram-32', name: '32GB DDR4-2933 ECC', price: 1100 },
      { id: 'ram-64', name: '64GB DDR4-2933 ECC', price: 2200 },
    ],
  },
  {
    id: 'storage', label: 'Storage', options: [
      { id: 'hdd-1tb', name: '1TB SATA 7.2K HDD', price: 500 },
      { id: 'ssd-480', name: '480GB SATA SSD', price: 1500 },
      { id: 'ssd-960', name: '960GB SATA SSD', price: 2800 },
      { id: 'nvme-1.9', name: '1.92TB NVMe SSD', price: 5200 },
    ],
  },
  {
    id: 'cpu', label: 'CPU', options: [
      { id: 'cpu-bronze', name: 'Xeon Bronze 3204 (6-core)', price: 2500 },
      { id: 'cpu-silver', name: 'Xeon Silver 4210R (10-core)', price: 4200 },
      { id: 'cpu-gold', name: 'Xeon Gold 5218 (16-core)', price: 7800 },
    ],
  },
  {
    id: 'gpu', label: 'GPU', options: [
      { id: 'gpu-none', name: 'Integrated Graphics', price: 0 },
      { id: 'gpu-t1000', name: 'NVIDIA T1000 8GB', price: 3500 },
      { id: 'gpu-a2000', name: 'NVIDIA RTX A2000 12GB', price: 6000 },
    ],
  },
]

export const BENEFITS_MARQUEE = ['Exclusive of taxes', 'Free Servicing', 'Free delivery', 'Free delivery']
