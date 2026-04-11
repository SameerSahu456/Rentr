/* ─────────────────────────────────────────────────────────────
   Centralized image asset registry
   All image paths in one place — import from here, not inline.
   ───────────────────────────────────────────────────────────── */

// ── Fallback ──────────────────────────────────────────────────
export const FALLBACK_IMAGE = '/images/fallback.svg'

// ── Products (Figma-extracted real photos) ───────────────────
export const PRODUCT_IMAGES = {
  // SVG illustrations (legacy)
  serverTower: '/images/products/server-tower.svg',
  rackServer: '/images/products/rack-server.svg',
  laptop: '/images/products/laptop.svg',
  desktop: '/images/products/desktop.svg',
  networking: '/images/products/networking.svg',
  harddisk: '/images/products/harddisk.svg',
  accessories: '/images/products/accessories.svg',
  dellServerMain: '/images/products/dell-server-main.png',
  dellServerShadow: '/images/products/dell-server-shadow.svg',
  heroServers: '/images/products/hero-servers.svg',
  heroServersMain: '/images/products/hero-servers-main.png',
  heroEllipseShadow: '/images/products/hero-ellipse-shadow.png',
  // Real product photos (from Figma)
  poweredgeT30: '/images/products/poweredge-t30.png',
  inspiron245000: '/images/products/inspiron-24-5000.png',
  dellR730xd: '/images/products/dell-r730xd.png',
}

// ── Category images (Figma-extracted real photos) ────────────
export const CATEGORY_IMAGES = {
  chasis: '/images/categories/chasis.png',
  desktops: '/images/categories/desktops.png',
  laptops: '/images/categories/laptops.png',
  server: '/images/categories/server.png',
  network: '/images/categories/network.png',
  harddisk: '/images/categories/harddisk.png',
  accessories: '/images/categories/accessories.png',
}

// ── Brand logos ───────────────────────────────────────────────
export const BRAND_IMAGES = {
  dell: '/images/brands/dell.svg',
  hp: '/images/brands/hp.svg',
  lenovo: '/images/brands/lenovo.svg',
  cisco: '/images/brands/cisco.svg',
  hpe: '/images/brands/hpe.svg',
  intel: '/images/brands/intel.svg',
  amd: '/images/brands/amd.svg',
  nvidia: '/images/brands/nvidia.svg',
  ibm: '/images/brands/ibm.svg',
  microsoft: '/images/brands/microsoft.svg',
  // Client partner logos (from Figma)
  accenture: '/images/brands/accenture.svg',
  cognizant: '/images/brands/cognizant.svg',
  hdfcBank: '/images/brands/hdfc-bank.svg',
}

// ── Avatars ───────────────────────────────────────────────────
export const AVATAR_IMAGES = {
  avatar1: '/images/avatars/customer-avatar.png',
  avatar2: '/images/avatars/customer-avatar-2.png',
  avatar3: '/images/avatars/customer-avatar-3.png',
  avatar4: '/images/avatars/customer-avatar-4.png',
}

// ── Misc ──────────────────────────────────────────────────────
export const MISC_IMAGES = {
  favicon: '/favicon.svg',
  icons: '/icons.svg',
}

// ── Default product image (most commonly used fallback) ──────
export const DEFAULT_PRODUCT_IMAGE = PRODUCT_IMAGES.serverTower

// ── Inline fallback handler for <img> onError ───────────────
// Usage: <img src={url} onError={handleImgError} />
export const handleImgError = (e) => {
  if (e.target.dataset.retried) {
    e.target.src = FALLBACK_IMAGE
  } else {
    e.target.dataset.retried = 'true'
    e.target.src = e.target.src // retry once
  }
}
