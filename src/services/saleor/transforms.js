// ─── Relay helpers ───

export function unwrapEdges(connection) {
  if (!connection?.edges) return []
  return connection.edges.map(edge => edge.node)
}

function getMetaValue(metadata, key) {
  if (!metadata) return ''
  const entry = metadata.find(m => m.key === key)
  return entry?.value || ''
}

function getAttributeValue(attributes, slug) {
  if (!attributes) return ''
  const attr = attributes.find(a => a.attribute?.slug === slug)
  return attr?.values?.[0]?.name || ''
}

// ─── Description parser ───

export function parseDescription(description) {
  if (!description) return ''
  if (typeof description === 'string') {
    try {
      const parsed = JSON.parse(description)
      return extractTextFromEditorJS(parsed)
    } catch {
      return description
    }
  }
  return extractTextFromEditorJS(description)
}

function extractTextFromEditorJS(data) {
  if (!data) return ''
  if (typeof data === 'string') return data

  // EditorJS format: { blocks: [{ type, data: { text } }] }
  if (data.blocks) {
    return data.blocks
      .map(block => {
        if (block.data?.text) return stripHtml(block.data.text)
        if (block.data?.items) return block.data.items.map(stripHtml).join(', ')
        return ''
      })
      .filter(Boolean)
      .join('\n')
  }

  // Saleor rich text format: { type: "doc", content: [...] }
  if (data.content) {
    return data.content
      .map(node => {
        if (node.type === 'paragraph' && node.content) {
          return node.content.map(c => c.text || '').join('')
        }
        return ''
      })
      .filter(Boolean)
      .join('\n')
  }

  return ''
}

function stripHtml(str) {
  if (!str) return ''
  return str.replace(/<[^>]*>/g, '')
}

// ─── Product transforms ───

function getPrice(product) {
  return product?.pricing?.priceRange?.start?.gross?.amount || 0
}

function getCurrency(product) {
  return product?.pricing?.priceRange?.start?.gross?.currency || 'INR'
}

export function transformProductForList(node) {
  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    price: getPrice(node),
    price_per_month: getPrice(node),
    category: node.category?.name || '',
    brand: getMetaValue(node.metadata, 'brand') || getAttributeValue(node.attributes, 'brand') || '',
    image: node.thumbnail?.url || '/images/products/server-tower.svg',
    image_url: node.thumbnail?.url || '/images/products/server-tower.svg',
    description: parseDescription(node.description),
    currency: getCurrency(node),
  }
}

export function transformProductForDetail(node) {
  const price = getPrice(node)
  const brand = getMetaValue(node.metadata, 'brand') || getAttributeValue(node.attributes, 'brand') || ''
  const productCode = getMetaValue(node.metadata, 'product_code') || getAttributeValue(node.attributes, 'product-code') || ''
  const images = node.media?.map(m => m.url) || []
  if (images.length === 0 && node.thumbnail?.url) {
    images.push(node.thumbnail.url)
  }

  const specs = (node.attributes || []).map(attr => ({
    label: attr.attribute?.name || '',
    value: attr.values?.map(v => v.name).join(', ') || '',
  }))

  const features = specs
    .filter(s => s.value)
    .slice(0, 4)
    .map(s => `${s.label}: ${s.value}`)

  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    brand,
    productCode,
    category: node.category?.name || 'Products',
    parentCategory: node.category?.parent?.name || 'Products',
    images: images.length > 0 ? images : ['/images/products/server-tower.svg'],
    pricePerMonth: price,
    description: parseDescription(node.description),
    sizeAndDimensions: getMetaValue(node.metadata, 'dimensions') || getAttributeValue(node.attributes, 'dimensions') || '',
    features,
    weight: getMetaValue(node.metadata, 'weight') || getAttributeValue(node.attributes, 'weight') || '',
    whatsNew: getMetaValue(node.metadata, 'whats_new') || '',
    monthlyRentalApprox: price,
    totalApprox: price * 12,
    model: getMetaValue(node.metadata, 'model') || '',
    specs,
    currency: getCurrency(node),
    variants: node.variants || [],
  }
}

// ─── Category transforms ───

export function transformCategories(saleorCategories) {
  return saleorCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    children: cat.children ? unwrapEdges(cat.children).map(child => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
    })) : [],
  }))
}

// ─── User transforms ───

export function transformUser(saleorUser) {
  if (!saleorUser) return null
  const firstName = saleorUser.firstName || ''
  const lastName = saleorUser.lastName || ''
  return {
    id: saleorUser.id,
    email: saleorUser.email,
    full_name: [firstName, lastName].filter(Boolean).join(' ') || saleorUser.email,
    phone: getMetaValue(saleorUser.metadata, 'phone') || '',
    role: getMetaValue(saleorUser.metadata, 'role') || 'customer',
    company_name: getMetaValue(saleorUser.metadata, 'company_name') || '',
    company_gst: getMetaValue(saleorUser.metadata, 'company_gst') || '',
    industry: getMetaValue(saleorUser.metadata, 'industry') || '',
    company_pan: getMetaValue(saleorUser.metadata, 'company_pan') || '',
    created_at: saleorUser.dateJoined || new Date().toISOString(),
  }
}

// ─── Order transforms ───

export function transformOrderForHistory(order) {
  const firstLine = order.lines?.[0]
  const totalQty = order.lines?.reduce((s, l) => s + l.quantity, 0) || 0
  return {
    id: order.id,
    item: firstLine?.productName || 'Order',
    serial: `#${order.number}`,
    qty: totalQty,
    salesPerson: 'N/A',
    subscribedOn: formatDate(order.created),
    rentalPeriod: '12 Months',
    unitPrice: order.total?.gross?.amount || 0,
    status: order.statusDisplay || order.status || 'Processing',
    lines: (order.lines || []).map(line => ({
      id: line.id,
      name: line.productName,
      sku: line.productSku,
      qty: line.quantity,
      unitPrice: line.unitPrice?.gross?.amount || 0,
      totalPrice: line.totalPrice?.gross?.amount || 0,
    })),
    shippingAddress: order.shippingAddress
      ? `${order.shippingAddress.streetAddress1}, ${order.shippingAddress.city}`
      : '',
    total: order.total?.gross?.amount || 0,
    currency: order.total?.gross?.currency || 'INR',
  }
}

function formatDate(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
