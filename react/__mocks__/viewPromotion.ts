import { Promotion, PromoViewData } from '../typings/events'

const eventType = 'vtex:promoView'
const eventName = 'vtex:promoView'
const event = 'promoView'

export function buildViewPromotionData({
  id,
  name,
  creative,
  position,
  products,
}: Promotion): PromoViewData {
  const promotion = {
    id,
    name,
    creative,
    position,
    products,
  }

  const viewPromotion: PromoViewData = {
    currency: 'USD',
    event,
    eventName,
    eventType,
    promotions: [promotion],
  }

  return viewPromotion
}
