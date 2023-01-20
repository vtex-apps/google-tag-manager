import { Impression, Seller } from '../typings/events'

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

  if (!categories) return {}

  const categoriesFormatted: { [key: string]: string } = {}

  categories.forEach((category, index) => {
    formatCategoriesHierarchy(categoriesFormatted, category, index)
  })

  return categoriesFormatted
}

export function getQuantity(seller: Seller) {
  if (!seller) return 1

  return seller.commertialOffer?.AvailableQuantity || 1
}

export function getImpressions(impressions: Impression[]) {
  if (!impressions) return []

  const formattedImpressions = impressions.map(impression => {
    const { product } = impression
    const { productName, productId, sku, brand, categories } = product
    const { itemId, seller } = sku

    const price = getPrice(seller)
    const quantity = getQuantity(seller)

    const categoriesHierarchy = getCategoriesWithHierarchy(categories)

    return {
      item_id: productId,
      item_name: productName,
      item_variant: itemId,
      item_brand: brand,
      price,
      quantity,
      ...categoriesHierarchy,
    }
  })

  return formattedImpressions
}

export function getCategory(rawCategories: string[]) {
  if (!rawCategories || !rawCategories.length) {
    return
  }

  return removeStartAndEndSlash(rawCategories[0])
}

// Transform this: "/Apparel & Accessories/Clothing/Tops/"
// To this: "Apparel & Accessories/Clothing/Tops"
export function removeStartAndEndSlash(category?: string) {
  return category?.replace(/^\/|\/$/g, '')
}

function splitIntoCategories(category?: string) {
  if (!category || !category.includes('/')) return

  const splitted = category.split('/')

  return splitted
}
