import push from './push'
import {
  Order,
  PixelMessage,
  ProductOrder,
  Impression,
  CartItem,
  AddToCartData,
} from '../typings/events'
import { AnalyticsEcommerceProduct } from '../typings/gtm'

export function sendEnhancedEcommerceEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:productView': {
      const { selectedSku, productName, brand, categories } = e.data.product

      let price

      try {
        price = e.data.product.items[0].sellers[0].commertialOffer.Price
      } catch {
        price = undefined
      }

      const data = {
        ecommerce: {
          detail: {
            products: [
              {
                brand,
                category: getCategory(categories),
                id: selectedSku.itemId,
                name: productName,
                variant: selectedSku.name,
                price,
              },
            ],
          },
        },
        event: 'productDetail',
      }

      push(data)

      return
    }

    case 'vtex:productClick': {
      const { productName, brand, categories, sku } = e.data.product
      const list = e.data.list ? { actionField: { list: e.data.list } } : {}

      let price

      try {
        price = e.data.product.items[0].sellers[0].commertialOffer.Price
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
                id: sku.itemId,
                name: productName,
                variant: sku.name,
                price,
              },
            ],
          },
        },
      }

      push(data)

      return
    }

    case 'vtex:addToCart': {
      const { items } = e.data as AddToCartData

      push({
        ecommerce: {
          add: {
            products: items.map(sku => ({
              brand: sku.brand,
              category: sku.category,
              id: sku.skuId,
              name: sku.name,
              price:
                sku.priceIsInt === true ? `${sku.price / 100}` : `${sku.price}`,
              quantity: sku.quantity,
              variant: sku.variant,
            })),
          },
          currencyCode: e.data.currency,
        },
        event: 'addToCart',
      })

      return
    }

    case 'vtex:removeFromCart': {
      const { items } = e.data

      push({
        ecommerce: {
          currencyCode: e.data.currency,
          remove: {
            products: items.map((sku: any) => ({
              brand: sku.brand,
              id: sku.skuId,
              category: sku.category,
              name: sku.name,
              price: `${sku.price}`,
              quantity: sku.quantity,
              variant: sku.variant,
            })),
          },
        },
        event: 'removeFromCart',
      })

      return
    }

    case 'vtex:orderPlaced': {
      const order = e.data

      const ecommerce = {
        purchase: {
          actionField: getPurchaseObjectData(order),
          products: order.transactionProducts.map((product: ProductOrder) =>
            getProductObjectData(product)
          ),
        },
      }

      push({
        // @ts-ignore
        event: 'orderPlaced',
        ...order,
        ecommerce,
      })

      // Backwards compatible event
      push({
        ecommerce,
        event: 'pageLoaded',
      })

      return
    }

    case 'vtex:productImpression': {
      const { currency, list, impressions, product, position } = e.data
      let oldImpresionFormat: Record<string, any> | null = null

      if (product != null && position != null) {
        // make it backwards compatible
        oldImpresionFormat = [
          getProductImpressionObjectData(list)({
            product,
            position,
          }),
        ]
      }

      const parsedImpressions = (impressions || []).map(
        getProductImpressionObjectData(list)
      )

      push({
        event: 'productImpression',
        ecommerce: {
          currencyCode: currency,
          impressions: oldImpresionFormat || parsedImpressions,
        },
      })

      return
    }

    case 'vtex:cartLoaded': {
      const { orderForm } = e.data

      push({
        event: 'checkout',
        ecommerce: {
          checkout: {
            actionField: {
              step: 1,
            },
            products: orderForm.items.map(getCheckoutProductObjectData),
          },
        },
      })

      break
    }

    case 'vtex:promoView': {
      const { promotions } = e.data

      push({
        event: 'promoView',
        ecommerce: {
          promoView: {
            promotions,
          },
        },
      })
      break
    }

    case 'vtex:promotionClick': {
      const { promotions } = e.data

      push({
        event: 'promotionClick',
        ecommerce: {
          promoClick: {
            promotions,
          },
        },
      })
      break
    }

    default: {
      break
    }
  }
}

function getPurchaseObjectData(order: Order) {
  return {
    affiliation: order.transactionAffiliation,
    coupon: order.coupon ? order.coupon : null,
    id: order.orderGroup,
    revenue: order.transactionTotal,
    shipping: order.transactionShipping,
    tax: order.transactionTax,
  }
}

function getProductObjectData(product: ProductOrder) {
  return {
    brand: product.brand,
    category: product.categoryTree?.join('/'),
    id: product.sku,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    variant: product.skuName,
  }
}

function getCategory(rawCategories: string[]) {
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

function getProductImpressionObjectData(list: string) {
  return ({ product, position }: Impression) => ({
    brand: product.brand,
    category: getCategory(product.categories),
    id: product.sku.itemId,
    list,
    name: product.productName,
    position,
    price: `${product.sku.seller!.commertialOffer.Price}`,
    variant: product.sku.name,
  })
}

function getCheckoutProductObjectData(
  item: CartItem
): AnalyticsEcommerceProduct {
  return {
    id: item.id,
    name: item.name,
    category: Object.keys(item.productCategories ?? {}).reduce(
      (categories, category) =>
        categories ? `${categories}/${category}` : category,
      ''
    ),
    brand: item.additionalInfo?.brandName ?? '',
    variant: item.skuName,
    price: item.sellingPrice / 100,
    quantity: item.quantity,
  }
}