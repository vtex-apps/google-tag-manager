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

function getCategoriesHierarchyByKey(
  categories: Record<string, string> | null,
  keysArray?: string[]
) {
  if (!keysArray || !keysArray.length || !categories) return []
  const categoriesFormatted: string[] = []
  const categoriesHierarchyFormatted = {}

  keysArray.forEach(key => {
    if (key) categoriesFormatted.push(categories[key])
  })

  categoriesFormatted.forEach((category, index) => {
    formatCategoriesHierarchy(categoriesHierarchyFormatted, category, index)
  })

  return categoriesHierarchyFormatted
}

export function getQuantity(seller: Seller) {
  const isAvailable = seller.commertialOffer.AvailableQuantity > 0

  return isAvailable ? 1 : 0
}

export function getImpressions(impressions: Impression[]) {
  if (!impressions || !impressions.length) return []

  const formattedImpressions = impressions.map(impression => {
    const { product, position } = impression
    const {
      productName,
      productId,
      productReference,
      sku,
      brand,
      categories,
    } = product

    const { itemId, seller, referenceId, name } = sku

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
      ...customDimenions({
        productReference,
        skuReference: referenceId?.Value,
        skuName: name,
        quantity,
      }),
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
  const {
    name,
    skuName,
    id,
    brand,
    sku,
    price,
    quantity,
    category,
    productRefId,
    skuRefId,
  } = product

  const productName = getProductNameWithoutVariant(name, skuName)

  const item = {
    item_id: id,
    item_name: productName,
    item_brand: brand,
    item_variant: sku,
    price,
    quantity,
    ...getCategoriesWithHierarchy([category]),
    ...customDimenions({
      productReference: productRefId,
      skuReference: skuRefId,
      skuName,
      quantity,
    }),
  }

  return item
}

export function formatCartItemsAndValue(
  cartItems: CartItem[],
  options?: {
    dividePrice: boolean
  }
) {
  let totalValue = 0.0

  if (!cartItems.length) return { items: [], totalValue }

  const items = cartItems.map((item: CartItem) => {
    const productName = getProductNameWithoutVariant(item.name, item.skuName)

    const shouldFormatPrice = item.priceIsInt ?? options?.dividePrice

    const formattedPrice = shouldFormatPrice ? item.price / 100 : item.price

    const itemBrand = item.brand ? item.brand : item.additionalInfo?.brandName

    const categoryIds = splitIntoCategories(item.productCategoryIds)
    const formattedCategories = item.category
      ? getCategoriesWithHierarchy([item.category])
      : getCategoriesHierarchyByKey(item.productCategories, categoryIds)

    totalValue += formattedPrice * item.quantity

    return {
      item_id: item.productId,
      item_brand: itemBrand,
      item_name: productName,
      item_variant: item.skuId,
      quantity: item.quantity,
      price: formattedPrice,
      ...formattedCategories,
      ...customDimenions({
        productReference: item.productRefId,
        skuReference: item.referenceId,
        skuName: item.variant,
        quantity: item.quantity,
      }),
    }
  })

  return { items, totalValue }
}

export function getPurchaseItems(orderProducts: ProductOrder[]) {
  return orderProducts.map(formatPurchaseProduct)
}

type ProductAvailability = 'available' | 'unavailable'

interface CustomDimensions {
  /** Product reference */
  dimension1: string
  /** SKU reference */
  dimension2: string
  /** SKU name */
  dimension3: string
  /** SKU availability */
  dimension4: ProductAvailability
}

interface CustomDimensionParams {
  productReference?: string
  skuReference?: string
  skuName?: string
  quantity: number
}

export function customDimenions(
  params: CustomDimensionParams
): CustomDimensions {
  return {
    dimension1: params.productReference ?? '',
    dimension2: params.skuReference ?? '',
    dimension3: params.skuName ?? '',
    dimension4: params.quantity ? 'available' : 'unavailable',
  }
}
