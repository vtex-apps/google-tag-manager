import { CategoryTree, Seller } from '../typings/events'

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

export function getCategoriesWithHierarchy(categoryTree: CategoryTree) {
  if (!categoryTree || !categoryTree.length) return

  const categories: { [key: string]: string } = {}

  categoryTree.forEach((category, index) => {
    const categoryHierarchyNumber = index + 1
    const isFirstCategory = categoryHierarchyNumber === 1
    const key = `item_category${isFirstCategory ? '' : categoryHierarchyNumber}`

    categories[key] = category.name
  })

  return categories
}

export function getQuantity(seller: Seller) {
  if (!seller) return 1

  return seller.commertialOffer?.AvailableQuantity || 1
}
