import updateEcommerce from './updateEcommerce'
import {
  PixelMessage,
  ProductOrder,
  Impression,
  CartItem,
  AddToCartData,
  RemoveFromCartData,
  ProductViewData,
  ProductClickData,
  ProductViewReferenceId,
  PromoViewData,
  OrderPlacedData,
  ProductImpressionData,
  CartLoadedData,
} from '../typings/events'
import { AnalyticsEcommerceProduct } from '../typings/gtm'
import {
  purchase,
  selectItem,
  selectPromotion,
  viewItem,
  viewItemList,
  viewPromotion,
  addToCart,
  removeFromCart,
} from './gaEvents'
import {
  getCategory,
  getSeller,
  getProductNameWithoutVariant,
  getPurchaseObjectData,
} from './utils'

const defaultReference = { Value: '' }

export async function sendEnhancedEcommerceEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:productView': {
      const {
        productId,
        productReference,
        selectedSku,
        productName,
        brand,
        categories,
      } = (e.data as ProductViewData).product

      const productAvailableQuantity = getSeller(selectedSku.sellers)
        .commertialOffer.AvailableQuantity

      const isAvailable =
        productAvailableQuantity > 0 ? 'available' : 'unavailable'

      // Product summary list title. Ex: 'List of products'
      const list = e.data.list ? { actionField: { list: e.data.list } } : {}

      // This type conversion is needed because vtex.store does not normalize the SKU Reference Id
      // Doing that there could possibly break some apps or stores, so it's better doing it here
      const skuReferenceId = (
        ((selectedSku.referenceId as unknown) as ProductViewReferenceId)?.[0] ??
        defaultReference
      ).Value

      let price

      try {
        price = getSeller(selectedSku.sellers).commertialOffer.Price
      } catch {
        price = undefined
      }

      const data = {
        ecommerce: {
          detail: {
            ...list,
            products: [
              {
                brand,
                category: getCategory(categories),
                id: productId,
                variant: selectedSku.itemId,
                name: productName,
                dimension1: productReference ?? '',
                dimension2: skuReferenceId ?? '',
                dimension3: selectedSku.name,
                dimension4: isAvailable,
                price,
              },
            ],
          },
        },
        event: 'productDetail',
      }

      viewItem(e.data)
      updateEcommerce('productDetail', data)

      return
    }

    case 'vtex:productClick': {
      const { product, position } = e.data as ProductClickData
      const {
        productName,
        brand,
        categories,
        sku,
        productId,
        productReference,
      } = product

      // Product summary list title. Ex: 'List of products'
      const list = e.data.list ? { actionField: { list: e.data.list } } : {}

      let price

      try {
        price = getSeller(sku?.sellers ?? product.items[0].sellers)
          .commertialOffer.Price
      } catch {
        price = undefined
      }

      const data = {
        event: 'productClick',
        ecommerce: {
          click: {
            ...list,
            products: [
              {
                brand,
                category: getCategory(categories),
                id: productId,
                variant: sku.itemId,
                name: productName,
                dimension1: productReference ?? '',
                dimension2: sku.referenceId?.Value ?? '',
                dimension3: sku.name,
                price,
                position,
              },
            ],
          },
        },
      }

      selectItem(e.data)
      updateEcommerce('productClick', data)

      return
    }

    case 'vtex:addToCart': {
      const { items } = e.data as AddToCartData

      const data = {
        ecommerce: {
          add: {
            products: items.map(item => ({
              brand: item.brand,
              category: item.category,
              id: item.productId,
              variant: item.skuId,
              name: item.name, // Product name
              price:
                item.priceIsInt === true
                  ? `${item.price / 100}`
                  : `${item.price}`,
              quantity: item.quantity,
              dimension1: item.productRefId ?? '',
              dimension2: item.referenceId ?? '', // SKU reference id
              dimension3: item.variant, // SKU name (variant)
            })),
          },
          currencyCode: e.data.currency,
        },
        event: 'addToCart',
      }

      addToCart(e.data)
      updateEcommerce('addToCart', data)

      return
    }

    case 'vtex:removeFromCart': {
      const { items } = e.data as RemoveFromCartData

      const data = {
        ecommerce: {
          currencyCode: e.data.currency,
          remove: {
            products: items.map(item => ({
              brand: item.brand,
              category: item.category,
              id: item.productId,
              variant: item.skuId,
              name: item.name, // Product name
              price:
                item.priceIsInt === true
                  ? `${item.price / 100}`
                  : `${item.price}`,
              quantity: item.quantity,
              dimension1: item.productRefId ?? '',
              dimension2: item.referenceId ?? '', // SKU reference id
              dimension3: item.variant, // SKU name (variant)
            })),
          },
        },
        event: 'removeFromCart',
      }

      removeFromCart(e.data)
      updateEcommerce('removeFromCart', data)

      return
    }

    case 'vtex:orderPlaced': {
      const order = e.data as OrderPlacedData

      const ecommerce = {
        purchase: {
          actionField: getPurchaseObjectData(order),
          products: order.transactionProducts.map((product: ProductOrder) =>
            getProductObjectData(product)
          ),
        },
      }

      const data = {
        // @ts-ignore
        event: 'orderPlaced',
        ...order,
        // The name ecommerceV2 was introduced as a fix, so it is possible that some clients
        // were using this as it was called before (ecommerce). For that reason,
        // it will also be sent as ecommerce to the dataLayer.
        ecommerce,
        // This variable is called ecommerceV2 so it matches the variable name present on the checkout
        // This way, users can have one single tag for checkout and orderPlaced events
        ecommerceV2: {
          ecommerce,
        },
      }

      purchase(order)
      updateEcommerce('orderPlaced', data)

      return
    }

    case 'vtex:productImpression': {
      const { currency, list, impressions } = e.data as ProductImpressionData

      const parsedImpressions = (impressions || []).map(
        getProductImpressionObjectData(list)
      )

      const data = {
        event: 'productImpression',
        ecommerce: {
          currencyCode: currency,
          impressions: parsedImpressions,
        },
      }

      viewItemList(e.data)
      updateEcommerce('productImpression', data)

      return
    }

    case 'vtex:cartLoaded': {
      const { orderForm } = e.data as CartLoadedData

      const data = {
        event: 'checkout',
        ecommerce: {
          checkout: {
            actionField: {
              step: 1,
            },
            products: orderForm.items.map(getCheckoutProductObjectData),
          },
        },
      }

      updateEcommerce('checkout', data)

      break
    }

    case 'vtex:promoView': {
      const { promotions } = e.data as PromoViewData

      const data = {
        event: 'promoView',
        ecommerce: {
          promoView: {
            promotions,
          },
        },
      }

      viewPromotion(e.data)
      updateEcommerce('promoView', data)

      break
    }

    case 'vtex:promotionClick': {
      const { promotions } = e.data as PromoViewData

      const data = {
        event: 'promotionClick',
        ecommerce: {
          promoClick: {
            promotions,
          },
        },
      }

      selectPromotion(e.data)
      updateEcommerce('promotionClick', data)

      break
    }

    default: {
      break
    }
  }
}

function getProductObjectData(product: ProductOrder) {
  const productName = getProductNameWithoutVariant(
    product.name,
    product.skuName
  )

  return {
    brand: product.brand,
    category: product.categoryTree?.join('/'),
    id: product.id, // Product id
    variant: product.sku, // SKU id
    name: productName, // Product name
    price: product.price,
    quantity: product.quantity,
    dimension1: product.productRefId ?? '',
    dimension2: product.skuRefId ?? '',
    dimension3: product.skuName, // SKU name (only variant)
  }
}

function getProductImpressionObjectData(list: string) {
  return ({ product, position }: Impression) => ({
    brand: product.brand,
    category: getCategory(product.categories),
    id: product.productId, // Product id
    variant: product.sku.itemId, // SKU id
    list,
    name: product.productName,
    position,
    price: `${product.sku.seller.commertialOffer.Price}`,
    dimension1: product.productReference ?? '',
    dimension2: product.sku.referenceId?.Value ?? '',
    dimension3: product.sku.name, // SKU name (variation only)
  })
}

function getCheckoutProductObjectData(
  item: CartItem
): AnalyticsEcommerceProduct {
  const productName = getProductNameWithoutVariant(item.name, item.skuName)

  return {
    id: item.productId, // Product id
    variant: item.id, // SKU id
    name: productName, // Product name without variant
    category: Object.keys(item.productCategories ?? {}).reduce(
      (categories, category) =>
        categories ? `${categories}/${category}` : category,
      ''
    ),
    brand: item.additionalInfo?.brandName ?? '',
    price: item.sellingPrice / 100,
    quantity: item.quantity,
    dimension1: item.productRefId ?? '',
    dimension2: item.referenceId ?? '', // SKU reference id
    dimension3: item.skuName,
  }
}
