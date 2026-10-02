export const promoCodes = [
  {
    code: 'WELCOME10',
    description: '10% off your first order',
    type: 'percentage',
    value: 10,
    minOrder: 0,
    expiresAt: null,
    usageLimit: 1,
    usedCount: 0,
    active: true
  },
  {
    code: 'UA20',
    description: '20% off orders over ₱3,000',
    type: 'percentage',
    value: 20,
    minOrder: 3000,
    expiresAt: null,
    usageLimit: 1,
    usedCount: 0,
    active: true
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping on any order',
    type: 'free_shipping',
    value: 0,
    minOrder: 0,
    expiresAt: null,
    usageLimit: 1,
    usedCount: 0,
    active: true
  }
]

export function validatePromoCode(code, subtotal) {
  const promo = promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase() && p.active)
  if (!promo) return { valid: false, message: 'Invalid or expired promo code' }
  if (promo.usedCount >= promo.usageLimit) return { valid: false, message: 'Promo code has reached its usage limit' }
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return { valid: false, message: 'Promo code has expired' }
  if (subtotal < promo.minOrder) return { valid: false, message: `Minimum order of ₱${promo.minOrder.toLocaleString()} required` }
  return { valid: true, promo }
}

export function applyPromoCode(promo, subtotal) {
  if (promo.type === 'percentage') {
    return Math.round(subtotal * (promo.value / 100))
  }
  if (promo.type === 'free_shipping') {
    return 0
  }
  return 0
}