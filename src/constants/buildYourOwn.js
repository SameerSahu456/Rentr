/* ─── Product Types ─── */

export const PRODUCT_TYPES = [
  {
    id: 'tower-server',
    label: 'Tower Server',
    description: 'Standalone servers for small-medium businesses',
    image: '/images/products/poweredge-t30.png',
    basePrice: 3000,
    categories: ['cpu', 'ram', 'storage', 'gpu', 'os', 'controller', 'network', 'psu'],
  },
  {
    id: 'rack-server',
    label: 'Rack Server',
    description: 'High-density servers for data centers',
    image: '/images/products/dell-r730xd.png',
    basePrice: 5000,
    categories: ['cpu', 'ram', 'storage', 'gpu', 'os', 'controller', 'network', 'psu'],
  },
  {
    id: 'workstation',
    label: 'Workstation',
    description: 'High-performance desktops for professionals',
    image: '/images/products/inspiron-24-5000.png',
    basePrice: 2500,
    categories: ['cpu', 'ram', 'storage', 'gpu', 'os'],
  },
  {
    id: 'laptop',
    label: 'Laptop',
    description: 'Business laptops configured to your needs',
    image: '/images/products/laptop.svg',
    basePrice: 2000,
    categories: ['laptop-cpu', 'laptop-ram', 'laptop-storage', 'laptop-gpu', 'os'],
  },
  {
    id: 'desktop',
    label: 'Desktop',
    description: 'Office desktops for everyday productivity',
    image: '/images/products/desktop.svg',
    basePrice: 1500,
    categories: ['desktop-cpu', 'laptop-ram', 'laptop-storage', 'os'],
  },
]

/* ─── All Component Categories ─── */

export const COMPONENT_CATEGORIES = {
  /* ── Server / Workstation CPUs ── */
  cpu: {
    id: 'cpu',
    title: 'Choose Processor (CPU)',
    icon: 'cpu',
    maxQty: 2,
    options: [
      { id: 'cpu-1', name: 'Intel Xeon Bronze 3204 (1.9GHz / 6-core / 85W)', price: 2500, sku: 'P02489-L21' },
      { id: 'cpu-2', name: 'Intel Xeon Silver 4210R (2.4GHz / 10-core / 100W)', price: 4200, sku: 'P15974-L21' },
      { id: 'cpu-3', name: 'Intel Xeon Gold 5218 (2.3GHz / 16-core / 125W)', price: 7800, sku: 'P02592-L21' },
      { id: 'cpu-4', name: 'Intel Xeon Gold 6230 (2.1GHz / 20-core / 125W)', price: 11500, sku: 'P02607-L21' },
      { id: 'cpu-5', name: 'Intel Xeon Platinum 8260 (2.4GHz / 24-core / 165W)', price: 18000, sku: 'P02661-L21' },
      { id: 'cpu-6', name: 'AMD EPYC 7302 (3.0GHz / 16-core / 155W)', price: 8500, sku: 'P25770-B21' },
      { id: 'cpu-7', name: 'AMD EPYC 7452 (2.35GHz / 32-core / 155W)', price: 14000, sku: 'P25771-B21' },
    ],
  },

  /* ── Laptop CPUs ── */
  'laptop-cpu': {
    id: 'laptop-cpu',
    title: 'Choose Processor (CPU)',
    icon: 'cpu',
    maxQty: 1,
    options: [
      { id: 'lcpu-1', name: 'Intel Core i5-1335U (10-core / 4.6GHz)', price: 1200, sku: 'i5-1335U' },
      { id: 'lcpu-2', name: 'Intel Core i7-1365U (12-core / 5.2GHz)', price: 2200, sku: 'i7-1365U' },
      { id: 'lcpu-3', name: 'Intel Core i7-13700H (14-core / 5.0GHz)', price: 3000, sku: 'i7-13700H' },
      { id: 'lcpu-4', name: 'Intel Core i9-13900H (14-core / 5.4GHz)', price: 4500, sku: 'i9-13900H' },
      { id: 'lcpu-5', name: 'AMD Ryzen 7 7840U (8-core / 5.1GHz)', price: 2800, sku: 'R7-7840U' },
    ],
  },

  /* ── Desktop CPUs ── */
  'desktop-cpu': {
    id: 'desktop-cpu',
    title: 'Choose Processor (CPU)',
    icon: 'cpu',
    maxQty: 1,
    options: [
      { id: 'dcpu-1', name: 'Intel Core i3-13100 (4-core / 4.5GHz)', price: 600, sku: 'i3-13100' },
      { id: 'dcpu-2', name: 'Intel Core i5-13500 (14-core / 4.8GHz)', price: 1200, sku: 'i5-13500' },
      { id: 'dcpu-3', name: 'Intel Core i7-13700 (16-core / 5.2GHz)', price: 2200, sku: 'i7-13700' },
      { id: 'dcpu-4', name: 'AMD Ryzen 5 7600 (6-core / 5.1GHz)', price: 1000, sku: 'R5-7600' },
      { id: 'dcpu-5', name: 'AMD Ryzen 7 7700 (8-core / 5.3GHz)', price: 1800, sku: 'R7-7700' },
    ],
  },

  /* ── Server GPU ── */
  gpu: {
    id: 'gpu',
    title: 'Choose Graphics Card (GPU)',
    icon: 'gpu',
    maxQty: 2,
    options: [
      { id: 'gpu-0', name: 'No GPU (Integrated Graphics)', price: 0, sku: 'Integrated' },
      { id: 'gpu-1', name: 'NVIDIA T400 4GB GDDR6 (Low Profile)', price: 1500, sku: 'NVIDIA-T400' },
      { id: 'gpu-2', name: 'NVIDIA T1000 8GB GDDR6', price: 3500, sku: 'NVIDIA-T1000' },
      { id: 'gpu-3', name: 'NVIDIA RTX A2000 12GB GDDR6', price: 6000, sku: 'NVIDIA-A2000' },
      { id: 'gpu-4', name: 'NVIDIA RTX A4000 16GB GDDR6', price: 12000, sku: 'NVIDIA-A4000' },
      { id: 'gpu-5', name: 'NVIDIA RTX A5000 24GB GDDR6', price: 20000, sku: 'NVIDIA-A5000' },
      { id: 'gpu-6', name: 'NVIDIA A100 40GB HBM2e (Data Center)', price: 45000, sku: 'NVIDIA-A100' },
    ],
  },

  /* ── Laptop GPU ── */
  'laptop-gpu': {
    id: 'laptop-gpu',
    title: 'Choose Graphics Card (GPU)',
    icon: 'gpu',
    maxQty: 1,
    options: [
      { id: 'lgpu-0', name: 'Integrated Intel Iris Xe Graphics', price: 0, sku: 'Intel-Iris' },
      { id: 'lgpu-1', name: 'NVIDIA GeForce MX550 2GB', price: 800, sku: 'MX550' },
      { id: 'lgpu-2', name: 'NVIDIA RTX A500 4GB GDDR6', price: 2500, sku: 'RTX-A500' },
      { id: 'lgpu-3', name: 'NVIDIA RTX A1000 6GB GDDR6', price: 4000, sku: 'RTX-A1000' },
    ],
  },

  /* ── Server RAM ── */
  ram: {
    id: 'ram',
    title: 'Choose RAM',
    icon: 'memory',
    maxQty: 8,
    options: [
      { id: 'ram-1', name: '8GB DDR4-2933 ECC Registered DIMM', price: 350, sku: 'P00918-B21' },
      { id: 'ram-2', name: '16GB DDR4-2933 ECC Registered DIMM', price: 600, sku: 'P00920-B21' },
      { id: 'ram-3', name: '32GB DDR4-2933 ECC Registered DIMM', price: 1100, sku: 'P00924-B21' },
      { id: 'ram-4', name: '64GB DDR4-2933 ECC Load Reduced DIMM', price: 2200, sku: 'P00930-B21' },
      { id: 'ram-5', name: '128GB DDR4-2933 ECC Load Reduced DIMM', price: 4500, sku: 'P11040-B21' },
      { id: 'ram-6', name: '16GB DDR5-4800 ECC Registered DIMM', price: 900, sku: 'P43322-B21' },
      { id: 'ram-7', name: '32GB DDR5-4800 ECC Registered DIMM', price: 1600, sku: 'P43324-B21' },
      { id: 'ram-8', name: '64GB DDR5-4800 ECC Registered DIMM', price: 3200, sku: 'P43328-B21' },
    ],
  },

  /* ── Laptop / Desktop RAM ── */
  'laptop-ram': {
    id: 'laptop-ram',
    title: 'Choose RAM',
    icon: 'memory',
    maxQty: 2,
    options: [
      { id: 'lram-1', name: '8GB DDR4-3200 SODIMM', price: 250, sku: 'DDR4-8G' },
      { id: 'lram-2', name: '16GB DDR4-3200 SODIMM', price: 450, sku: 'DDR4-16G' },
      { id: 'lram-3', name: '32GB DDR4-3200 SODIMM', price: 900, sku: 'DDR4-32G' },
      { id: 'lram-4', name: '16GB DDR5-5600 SODIMM', price: 600, sku: 'DDR5-16G' },
      { id: 'lram-5', name: '32GB DDR5-5600 SODIMM', price: 1100, sku: 'DDR5-32G' },
    ],
  },

  /* ── Server Storage ── */
  storage: {
    id: 'storage',
    title: 'Choose Storage (ROM / SSD / HDD)',
    icon: 'storage',
    maxQty: 6,
    options: [
      { id: 'hdd-1', name: '500GB SATA 7.2K RPM 3.5" HDD', price: 300, sku: '861681-B21' },
      { id: 'hdd-2', name: '1TB SATA 7.2K RPM 3.5" HDD', price: 500, sku: '861691-B21' },
      { id: 'hdd-3', name: '2TB SATA 7.2K RPM 3.5" HDD', price: 800, sku: '872489-B21' },
      { id: 'hdd-4', name: '600GB SAS 10K RPM 2.5" Enterprise HDD', price: 900, sku: '872477-B21' },
      { id: 'hdd-5', name: '1.2TB SAS 10K RPM 2.5" Enterprise HDD', price: 1200, sku: '872479-B21' },
      { id: 'ssd-1', name: '240GB SATA SSD 2.5" Mixed Use', price: 800, sku: 'P18420-B21' },
      { id: 'ssd-2', name: '480GB SATA SSD 2.5" Mixed Use', price: 1500, sku: 'P18432-B21' },
      { id: 'ssd-3', name: '960GB SATA SSD 2.5" Mixed Use', price: 2800, sku: 'P18434-B21' },
      { id: 'ssd-4', name: '1.92TB NVMe SSD 2.5" Mixed Use', price: 5200, sku: 'P13676-B21' },
      { id: 'ssd-5', name: '3.84TB NVMe SSD 2.5" Read Intensive', price: 8500, sku: 'P13674-B21' },
    ],
  },

  /* ── Laptop / Desktop Storage ── */
  'laptop-storage': {
    id: 'laptop-storage',
    title: 'Choose Storage (SSD)',
    icon: 'storage',
    maxQty: 2,
    options: [
      { id: 'lstor-1', name: '256GB M.2 NVMe SSD', price: 300, sku: 'NVMe-256' },
      { id: 'lstor-2', name: '512GB M.2 NVMe SSD', price: 600, sku: 'NVMe-512' },
      { id: 'lstor-3', name: '1TB M.2 NVMe SSD', price: 1100, sku: 'NVMe-1TB' },
      { id: 'lstor-4', name: '2TB M.2 NVMe SSD', price: 2000, sku: 'NVMe-2TB' },
    ],
  },

  /* ── OS ── */
  os: {
    id: 'os',
    title: 'Choose Operating System',
    icon: 'software',
    maxQty: 1,
    options: [
      { id: 'os-0', name: 'No Operating System', price: 0, sku: 'No-OS' },
      { id: 'os-1', name: 'Windows Server 2022 Standard (16-core)', price: 3500, sku: 'P46171-B21' },
      { id: 'os-2', name: 'Windows Server 2022 Datacenter (16-core)', price: 7500, sku: 'P46172-B21' },
      { id: 'os-3', name: 'Windows 11 Pro', price: 800, sku: 'Win11-Pro' },
      { id: 'os-4', name: 'Ubuntu 22.04 LTS', price: 0, sku: 'Ubuntu-22' },
      { id: 'os-5', name: 'Red Hat Enterprise Linux 9 (1 Year)', price: 2800, sku: 'G5J64AAE' },
      { id: 'os-6', name: 'VMware vSphere Standard (1 Year)', price: 4200, sku: 'BD711AAE' },
    ],
  },

  /* ── Network ── */
  network: {
    id: 'network',
    title: 'Choose Network Adapter',
    icon: 'network',
    maxQty: 2,
    options: [
      { id: 'net-0', name: 'Onboard 1GbE 4-port (Included)', price: 0, sku: 'Built-in' },
      { id: 'net-1', name: '10GbE 2-port SFP+ Network Adapter', price: 1800, sku: '727055-B21' },
      { id: 'net-2', name: '25GbE 2-port SFP28 Network Adapter', price: 3500, sku: 'P10114-B21' },
      { id: 'net-3', name: '10GBase-T 2-port Ethernet Adapter', price: 2200, sku: '813661-B21' },
      { id: 'net-4', name: 'InfiniBand HDR 100Gb 1-port Adapter', price: 8000, sku: 'P23664-B21' },
    ],
  },

  /* ── RAID Controller ── */
  controller: {
    id: 'controller',
    title: 'Choose RAID Controller',
    icon: 'controller',
    maxQty: 1,
    options: [
      { id: 'ctrl-0', name: 'Software RAID (S100i SR Gen10) — Included', price: 0, sku: 'Built-in' },
      { id: 'ctrl-1', name: 'Smart Array P408i-a (8 Lanes / 2GB Cache)', price: 1800, sku: '804331-B21' },
      { id: 'ctrl-2', name: 'Smart Array P816i-a (16 Lanes / 4GB Cache)', price: 3200, sku: '804338-B21' },
      { id: 'ctrl-3', name: 'MegaRAID 9460-8i (8 Port / 2GB Cache)', price: 2500, sku: 'MR-9460' },
    ],
  },

  /* ── PSU ── */
  psu: {
    id: 'psu',
    title: 'Choose Power Supply',
    icon: 'psu',
    maxQty: 2,
    options: [
      { id: 'psu-1', name: '500W Flex Slot Platinum Hot Plug', price: 400, sku: '865408-B21' },
      { id: 'psu-2', name: '800W Flex Slot Platinum Hot Plug', price: 700, sku: '865414-B21' },
      { id: 'psu-3', name: '1600W Flex Slot Platinum Hot Plug', price: 1200, sku: '830272-B21' },
    ],
  },
}
