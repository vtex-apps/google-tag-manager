import {
  AddToCartData,
  RemoveFromCartData,
  PromoViewData,
  OrderPlacedData,
  AddPaymentInfoData,
  ProductClickData,
  ProductViewData,
  ProductImpressionData,
  BeginCheckoutData,
  ViewCartData,
  SearchData,
  RefundData,
  AddToWishlistData,
} from '../typings/events'
import updateEcommerce from './updateEcommerce'
import {
  getPrice,
  getSeller,
  getCategoriesWithHierarchy,
  getQuantity,
  getImpressions,
  getDiscount,
  getPurchaseObjectData,
  getPurchaseItems,
  formatCartItemsAndValue,
} from './utils'
import shouldSendGA4Events from './utils/shouldSendGA4Events'

export function viewItem(eventData: ProductViewData) {
  if (!shouldSendGA4Events()) return

  const eventName = 'view_item'

  const { currency, product, list } = eventData

  const { selectedSku, productName, productId, categories, brand } = product

  const { itemId: variant } = selectedSku

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
    discount,
    quantity,
    price: value,
    ...categoriesHierarchy,
  }

  const data = {
    currency,
    value,
    items: [item],
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function viewItemList(eventData: ProductImpressionData) {
  if (!shouldSendGA4Events()) return

  const eventName = 'view_item_list'

  const { list, impressions } = eventData

  const items = getImpressions(impressions)

  const data = {
    item_list_name: list,
    items,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function selectItem(eventData: ProductClickData) {
  if (!shouldSendGA4Events()) return

  const eventName = 'select_item'

  const { product, list, position } = eventData

  const { sku, productName, productId, categories, brand } = product

  const { itemId: variant } = sku

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

export function selectPromotion(eventData: PromoViewData) {
  if (!shouldSendGA4Events()) return

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

export function viewPromotion(eventData: PromoViewData) {
  if (!shouldSendGA4Events()) return

  const eventName = 'view_promotion'

  const {
    promotions: [{ creative, position, id, name, products }],
  } = eventData

  let items: Array<{ item_id: string; item_name: string }> = []

  if (products?.length) {
    items = products.map(product => ({
      item_id: product.productId,
      item_name: product.productName,
    }))
  }

  const data = {
    creative_name: creative,
    creative_slot: position,
    promotion_id: id,
    promotion_name: name,
    items,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function addToCart(eventData: AddToCartData) {
  if (!shouldSendGA4Events()) return

  const eventName = 'add_to_cart'

  const { items: eventDataItems, currency } = eventData

  const { items, totalValue } = formatCartItemsAndValue(eventDataItems)

  const data = {
    items,
    currency,
    value: totalValue,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function removeFromCart(eventData: RemoveFromCartData) {
  if (!shouldSendGA4Events()) return

  const eventName = 'remove_from_cart'

  const { items: eventDataItems, currency } = eventData

  const { items, totalValue } = formatCartItemsAndValue(eventDataItems)

  const data = {
    items,
    currency,
    value: totalValue,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function purchase(eventData: OrderPlacedData) {
  if (!shouldSendGA4Events()) return

  const eventName = 'purchase'

  const { id, revenue, tax, shipping, coupon } = getPurchaseObjectData(
    eventData
  )

  const { transactionProducts, currency } = eventData

  const items = getPurchaseItems(transactionProducts)

  const data = {
    transaction_id: id,
    value: revenue,
    tax,
    shipping,
    coupon,
    items,
    currency,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function addPaymentInfo(eventData: AddPaymentInfoData) {
  const eventName = 'add_payment_info'

  const { currency, payment, items: eventDataItems } = eventData
  const { value, group } = payment

  const { items } = formatCartItemsAndValue(eventDataItems)

  const formattedValue = value / 100

  const data = {
    currency,
    value: formattedValue,
    payment_type: group,
    items,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function beginCheckout(eventData: BeginCheckoutData) {
  const eventName = 'begin_checkout'

  const { currency, items: eventDataItems } = eventData

  const { items, totalValue } = formatCartItemsAndValue(eventDataItems)

  const data = {
    currency,
    value: totalValue,
    items,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function viewCart(eventData: ViewCartData) {
  const eventName = 'view_cart'

  const { currency, items: eventDataItems } = eventData

  const { items, totalValue } = formatCartItemsAndValue(eventDataItems)

  const data = {
    currency,
    value: totalValue,
    items,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function addToWishlist(eventData: AddToWishlistData) {
  const eventName = 'add_to_wishlist'

  const { currency, product, list } = eventData

  const { selectedSku, productName, productId, categories, brand } = product

  const { itemId: variant } = selectedSku

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
    discount,
    quantity,
    price: value,
    ...categoriesHierarchy,
  }

  const data = {
    currency,
    value,
    items: [item],
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function refund(eventData: RefundData) {
  const eventName = 'refund'

  const { id, revenue, tax, shipping, coupon } = getPurchaseObjectData(
    eventData
  )

  const { transactionProducts, currency } = eventData

  const items = getPurchaseItems(transactionProducts)

  const data = {
    transaction_id: id,
    value: revenue,
    tax,
    shipping,
    coupon,
    items,
    currency,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function search(eventData: SearchData) {
  const eventName = 'search'

  const { term } = eventData

  const data = {
    search_term: term,
  }

  updateEcommerce(eventName, { ecommerce: data })
}
