import { ProductViewData, ProductViewReferenceId } from '../typings/events'

type CustomDimensionSkuAvailability = 'available' | 'unavailable'

interface CustomDimensions {
  /** Product reference */
  dimension1: string
  /** SKU reference */
  dimension2: string
  /** SKU name */
  dimension3: string
  /** SKU availability */
  dimension4: CustomDimensionSkuAvailability
}

interface CustomDimensionParams {
  productReference?: string
  skuReference?: string
  skuName?: string
  quantity: number
}

export function customDimensions(
  params: CustomDimensionParams
): CustomDimensions {
  return {
    dimension1: params.productReference ?? '',
    dimension2: params.skuReference ?? '',
    dimension3: params.skuName ?? '',
    dimension4: customDimensionSkuAvailability(params.quantity),
  }
}

export function customDimensionSkuAvailability(
  quantity: number
): CustomDimensionSkuAvailability {
  return quantity ? 'available' : 'unavailable'
}

export function productViewSkuReference(
  product: ProductViewData['product']
): string {
  const defaultReference = { Value: '' }

  // The `vtex:productView` is the only event where the
  // `product.selectedSku.referenceId` is different between its type and actual
  // data. Type `Item` (for `selectedSku`) specifies `referenceId` as a single
  // `{ Key: string; Value: string }` object type. However, in this event,
  // `referenceId` comes as an array of that object.
  //
  // This type conversion is needed because vtex.store does not normalize the
  // SKU Reference ID. Doing that there could possibly break some apps or
  // stores, so it's better doing it here.
  const skuReferenceId = (
    ((product.selectedSku
      .referenceId as unknown) as ProductViewReferenceId)?.[0] ??
    defaultReference
  ).Value

  return skuReferenceId ?? ''
}
