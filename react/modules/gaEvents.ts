import {
  CartItem,
  PixelMessage,
  AddToCartData,
  RemoveFromCartData,
  PromoViewData,
  OrderPlacedData,
  ProductClickData,
  ProductViewData,
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
  getProductNameWithoutVariant,
} from './utils'
import shouldMergeUAEvents from './utils/shouldMergeUAEvents'

export function viewItem(eventData: ProductViewData) {
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

export function selectItem(eventData: ProductClickData) {
  if (!shouldMergeUAEvents()) return

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

export function viewPromotion(eventData: PromoViewData) {
  if (!shouldMergeUAEvents()) return

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
  if (!shouldMergeUAEvents()) return

  const eventName = 'add_to_cart'

  const { items: eventDataItems, currency } = eventData

  let totalValue = 0.0
  const items = eventDataItems.map((item: CartItem) => {
    const productName = getProductNameWithoutVariant(item.name, item.skuName)
    const formattedPrice =
      item.priceIsInt === true ? item.price / 100 : item.price

    totalValue += formattedPrice

    return {
      item_id: item.productId,
      item_brand: item.brand,
      item_name: productName,
      item_variant: item.skuId,
      quantity: item.quantity,
      price: formattedPrice,
      ...getCategoriesWithHierarchy([item.category]),
    }
  })

  const data = {
    items,
    currency,
    value: totalValue,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function removeFromCart(eventData: RemoveFromCartData) {
  if (!shouldMergeUAEvents()) return

  const eventName = 'remove_from_cart'

  const { items: eventDataItems, currency } = eventData

  let totalValue = 0.0
  const items = eventDataItems.map((item: CartItem) => {
    const productName = getProductNameWithoutVariant(item.name, item.skuName)
    const formattedPrice =
      item.priceIsInt === true ? item.price / 100 : item.price

    totalValue += formattedPrice

    return {
      item_id: item.productId,
      item_brand: item.brand,
      item_name: productName,
      item_variant: item.skuId,
      quantity: item.quantity,
      price: formattedPrice,
      ...getCategoriesWithHierarchy([item.category]),
    }
  })

  const data = {
    items,
    currency,
    value: totalValue,
  }

  updateEcommerce(eventName, { ecommerce: data })
}

export function purchase(eventData: OrderPlacedData) {
  if (!shouldMergeUAEvents()) return

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
