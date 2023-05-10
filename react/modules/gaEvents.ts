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
  AddShippingInfoData,
  ViewCartData,
  SearchData,
  LoginData,
  RefundData,
  AddToWishlistData,
  SignUpData,
  ShareData,
  PromotionClickData,
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
import { customDimensions, productViewSkuReference } from './customDimensions'
import shouldSendGA4Events from './utils/shouldSendGA4Events'

export function viewItem(eventData: ProductViewData) {
  if (!shouldSendGA4Events()) return

  const eventName = 'view_item'

  const { currency, product, list } = eventData

  const {
    selectedSku,
    productName,
    productId,
    productReference,
    categories,
    brand,
  } = product

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
    ...customDimensions({
      productReference,
      skuReference: productViewSkuReference(product),
      skuName: selectedSku.name,
      quantity,
    }),
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

  const {
    sku,
    productName,
    productId,
    productReference,
    categories,
    brand,
  } = product

  const { itemId: variant, referenceId, name } = sku

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
    ...customDimensions({
      productReference,
      skuReference: referenceId?.Value,
      skuName: name,
      quantity,
    }),
  }

  const data = {
    item_list_name: list,
    items: [item],
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function selectPromotion(eventData: PromotionClickData) {
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

export function addShippingInfo(eventData: AddShippingInfoData) {
  const eventName = 'add_shipping_info'

  const { currency, items: eventDataItems, shippingTier, value } = eventData

  const { items } = formatCartItemsAndValue(eventDataItems)

  const data = {
    currency,
    value,
    items,
    shipping_tier: shippingTier,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function viewCart(eventData: ViewCartData) {
  const eventName = 'view_cart'

  const { currency, items: eventDataItems } = eventData

  const { items, totalValue } = formatCartItemsAndValue(eventDataItems, {
    dividePrice: true,
  })

  const data = {
    currency,
    value: totalValue,
    items,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function addToWishlist(eventData: AddToWishlistData) {
  const eventName = 'add_to_wishlist'

  const { currency, items, list } = eventData

  const { product } = items

  const {
    sku,
    productName,
    productId,
    categories,
    brand,
    productReference,
  } = product

  const { itemId: variant } = sku

  const seller = getSeller(sku.sellers)
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
    ...customDimensions({
      productReference,
      skuReference: sku.referenceId.Value,
      skuName: sku.name,
      quantity,
    }),
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

  const { currency } = eventData

  const {
    tax,
    shipping,
    value,
    transactionId,
    items: orderItems,
  } = eventData.order

  const items = getPurchaseItems(orderItems)

  const data = {
    transaction_id: transactionId,
    value,
    tax,
    shipping,
    items,
    currency,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function login(eventData: LoginData) {
  const eventName = 'login'

  const { method } = eventData

  const data = {
    method,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function signUp(eventData: SignUpData) {
  const eventName = 'sign_up'

  const { method } = eventData

  const data = {
    method,
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

export function share(eventData: ShareData) {
  const eventName = 'share'

  const { method, contentType, itemId } = eventData

  const data = {
    method,
    content_type: contentType,
    item_id: itemId,
  }

  updateEcommerce(eventName, { ecommerce: data })
}
