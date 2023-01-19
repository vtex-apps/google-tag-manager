import { PixelMessage } from '../typings/events'
import updateEcommerce from './updateEcommerce'
import {
  getPrice,
  getSeller,
  getCategoriesWithHierarchyFromTree,
  getQuantity,
  getImpressions,
} from './utils'

export const shouldMergeUAEvents = () => Boolean(window?.__gtm__?.mergeUAEvents)

export function viewItem(eventData: PixelMessage['data']) {
  if (!shouldMergeUAEvents()) return

  const eventName = 'view_item'

  const { currency, product, list } = eventData

  const { selectedSku, productName, productId, categoryTree, brand } = product

  const { name: variant } = selectedSku

  const seller = getSeller(selectedSku.sellers)
  const value = getPrice(seller)
  const categoriesHierarchy = getCategoriesWithHierarchyFromTree(categoryTree)
  const quantity = getQuantity(seller)

  const item = {
    item_id: productId,
    item_name: productName,
    item_list_name: list,
    item_brand: brand,
    item_variant: variant,
    quantity,
    ...categoriesHierarchy,
  }

  const data = {
    currency,
    value,
    items: [item],
  }

  updateEcommerce(eventName, data)
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

  updateEcommerce(eventName, data)
}
