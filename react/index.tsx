import { canUseDOM } from 'vtex.render-runtime'

import push from './modules/push'
import { Order, PixelMessage, ProductOrder, Impression } from './typings/events'

export default function() {
  return null
} // no-op for extension point

export function handleEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:pageView': {
      push({
        event: 'pageView',
        location: e.data.pageUrl,
        page: e.data.pageUrl.replace(e.origin, ''),
        referrer: e.data.referrer,
        ...(e.data.pageTitle && {
          title: e.data.pageTitle,
        }),
      })
      return
    }
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
      const { items } = e.data

      push({
        ecommerce: {
          add: {
            products: items.map((sku: any) => ({
              brand: sku.brand,
              category: sku.category,
              id: sku.skuId,
              name: sku.name,
              price: `${sku.price}`,
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
    case 'vtex:productImpression':
      {
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
      }
      return
    case 'vtex:userData': {
      const data = e.data
      if (!data.isAuthenticated) {
        return
      }
      push({
        event: 'userData',
        userId: data.id,
      })
      return
    }
    default: {
      return
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
    category: product.categoryTree && product.categoryTree.join('/'),
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
function removeStartAndEndSlash(category: string) {
  return category && category.replace(/^\/|\/$/g, '')
}

const getProductImpressionObjectData = (list: string) => ({
  product,
  position,
}: Impression) => ({
  brand: product.brand,
  category: getCategory(product.categories),
  id: product.sku.itemId,
  list,
  name: product.productName,
  position,
  price: `${product.sku.seller!.commertialOffer.Price}`,
  variant: product.sku.name,
})

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
