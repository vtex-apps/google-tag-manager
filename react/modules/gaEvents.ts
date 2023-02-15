import { PixelMessage } from '../typings/events'
import updateEcommerce from './updateEcommerce'
import {
  getPrice,
  getSeller,
  getCategoriesWithHierarchy,
  getQuantity,
  getImpressions,
  getDiscount,
} from './utils'
import shouldMergeUAEvents from './utils/shouldMergeUAEvents'

export function viewItem(eventData: PixelMessage['data']) {
  if (!shouldMergeUAEvents()) return

  const eventName = 'view_item'

  const { currency, product, list, position } = eventData

  const { selectedSku, productName, productId, categories, brand } = product

  const { name: variant } = selectedSku

  const seller = getSeller(selectedSku.sellers)
  const value = getPrice(seller)
  const categoriesHierarchy = getCategoriesWithHierarchy(categories)
  const discount = getDiscount(seller)
  const quantity = getQuantity(seller)

  const item = {
    item_id: productId,
    item_name: productName,
    item_list_name: list,
    item_brand: brand,
    item_variant: variant,
    index: position,
    discount,
    quantity,
    ...categoriesHierarchy,
  }

  const data = {
    currency,
    value,
    items: [item],
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function viewItemList(eventData: PixelMessage['data']) {
  if (!shouldMergeUAEvents()) return

  const eventName = 'view_item_list'

  const { list, impressions } = eventData

  const items = getImpressions(impressions)

  const data = {
    item_list_name: list,
    items,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function selectItem(eventData: PixelMessage['data']) {
  if (!shouldMergeUAEvents()) return

  const eventName = 'select_item'

  const { product, list, position } = eventData

  const { sku, productName, productId, categories, brand } = product

  const { name: variant } = sku

  const seller = getSeller(sku.sellers)
  const price = getPrice(seller)
  const categoriesHierarchy = getCategoriesWithHierarchy(categories)
  const discount = getDiscount(seller)
  const quantity = getQuantity(seller)

  const item = {
    item_id: productId,
    item_name: productName,
    item_list_name: list,
    item_brand: brand,
    item_variant: variant,
    index: position,
    price,
    quantity,
    discount,
    ...categoriesHierarchy,
  }

  const data = {
    item_list_name: list,
    items: [item],
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function selectPromotion(eventData: PixelMessage['data']) {
  if (!shouldMergeUAEvents()) return

  const eventName = 'select_promotion'
  const [promotion] = eventData.promotions

  const data = {
    creative_name: promotion.creative,
    creative_slot: promotion.position,
    promotion_id: promotion.id,
    promotion_name: promotion.name,
  }

  updateEcommerce(eventName, { ecommerce: data })
}
