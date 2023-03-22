import {
  CartItem,
  Impression,
  Order,
  ProductOrder,
  Seller,
} from '../typings/events'

export function getSeller(sellers: Seller[]) {
  const defaultSeller = sellers.find(seller => seller.sellerDefault)

  if (!defaultSeller) {
    return sellers[0]
  }

  return defaultSeller
}

export function getPrice(seller: Seller) {
  let price

  try {
    price = seller.commertialOffer.Price
  } catch {
    price = undefined
  }

  return price
}

function formatCategoriesHierarchy(
  categories: { [key: string]: string },
  value: string,
  index: number
) {
  const categoryHierarchyNumber = index + 1
  const isFirstCategory = categoryHierarchyNumber === 1
  const key = `item_category${isFirstCategory ? '' : categoryHierarchyNumber}`

  categories[key] = value
}

export function getCategoriesWithHierarchy(categoriesArray: string[]) {
  if (!categoriesArray || !categoriesArray.length) return

  const categoryString = getCategory(categoriesArray)
  const categories = splitIntoCategories(categoryString)

  if (!categories || !categoryString) return {}

  const categoriesFormatted: { [key: string]: string } = {}

  if (!categories || !categories.length) {
    formatCategoriesHierarchy(categoriesFormatted, categoryString, 0)
  } else {
    categories.forEach((category, index) => {
      formatCategoriesHierarchy(categoriesFormatted, category, index)
    })
  }

  return categoriesFormatted
}

export function getQuantity(seller: Seller) {
  const isAvailable = seller.commertialOffer.AvailableQuantity > 0

  return isAvailable ? 1 : 0
}

export function getImpressions(impressions: Impression[]) {
  if (!impressions || !impressions.length) return []

  const formattedImpressions = impressions.map(impression => {
    const { product, position } = impression
    const { productName, productId, sku, brand, categories } = product
    const { itemId, seller } = sku

    const price = getPrice(seller)
    const discount = getDiscount(seller)
    const quantity = getQuantity(seller)

    const categoriesHierarchy = getCategoriesWithHierarchy(categories)

    return {
      item_id: productId,
      item_name: productName,
      item_variant: itemId,
      item_brand: brand,
      index: position,
      discount,
      price,
      quantity,
      ...categoriesHierarchy,
    }
  })

  return formattedImpressions
}

export function getDiscount(seller: Seller) {
  if (!seller.commertialOffer.PriceWithoutDiscount) return 0

  const { commertialOffer } = seller
  const { Price, PriceWithoutDiscount } = commertialOffer

  if (PriceWithoutDiscount <= Price) return 0

  let price

  try {
    price = PriceWithoutDiscount - Price
  } catch {
    price = 0
  }

  return price
}

export function getCategory(rawCategories: string[]) {
  if (!rawCategories || !rawCategories.length) {
    return
  }

  return removeStartAndEndSlash(rawCategories[0])
}

// Transform this: "/Apparel & Accessories/Clothing/Tops/"
// To this: "Apparel & Accessories/Clothing/Tops"
function removeStartAndEndSlash(category?: string) {
  return category?.replace(/^\/|\/$/g, '')
}

function splitIntoCategories(category?: string) {
  if (!category) return

  const splitted = category.split('/')

  return splitted
}

export function getPurchaseObjectData(order: Order) {
  return {
    affiliation: order.transactionAffiliation,
    coupon: order.coupon ? order.coupon : null,
    id: order.orderGroup,
    revenue: order.transactionTotal,
    shipping: order.transactionShipping,
    tax: order.transactionTax,
  }
}

export function getProductNameWithoutVariant(
  productNameWithVariant: string,
  variant: string
) {
  const indexOfVariant = productNameWithVariant.lastIndexOf(variant)

  if (indexOfVariant === -1 || indexOfVariant === 0) {
    return productNameWithVariant
  }

  return productNameWithVariant.substring(0, indexOfVariant - 1) // Removes the variant and the whitespace
}

function formatPurchaseProduct(product: ProductOrder) {
  const { name, skuName, id, brand, sku, price, quantity, category } = product

  const productName = getProductNameWithoutVariant(name, skuName)

  const item = {
    item_id: id,
    item_name: productName,
    item_brand: brand,
    item_variant: sku,
    price,
    quantity,
    ...getCategoriesWithHierarchy([category]),
  }

  return item
}

export function formatCartItemsAndValue(cartItems: CartItem[]) {
  let totalValue = 0.0

  if (!cartItems.length) return { items: [], totalValue }

  const items = cartItems.map((item: CartItem) => {
    const productName = getProductNameWithoutVariant(item.name, item.skuName)
    const formattedPrice =
      item.priceIsInt === true ? item.price / 100 : item.price

    totalValue += formattedPrice * item.quantity

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

  return { items, totalValue }
}

export function getPurchaseItems(orderProducts: ProductOrder[]) {
  return orderProducts.map(formatPurchaseProduct)
}
