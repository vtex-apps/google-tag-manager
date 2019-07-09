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
      const { productId, productName, brand, categories } = e.data.product

      const category = categories[0] as string

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
                category: category && category.replace(/^\/|\/$/g, ''),
                id: productId,
                name: productName,
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
    case 'vtex:addToCart': {
      const { items } = e.data

      push({
        ecommerce: {
          add: {
            products: items.map((sku: any) => ({
              brand: sku.brand,
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
      const order = e.data as Order

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
          oldImpresionFormat = [getProductImpressionObjectData(list)({
            product,
            position,
          })]
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
    category: product.category,
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

  const categories = rawCategories.map(function(categoryPath: string) {
    const splitedPath = categoryPath.split('/').filter(Boolean)
    return splitedPath[0]
  })

  return categories ? categories[0] : categories
}

const getProductImpressionObjectData = (list: string) => ({
  product,
  position,
}: Impression) => ({
  brand: product.brand,
  category: getCategory(product.categories),
  id: product.productId,
  list,
  name: product.productName,
  position,
  price: `${product.sku.seller!.commertialOffer.Price}`,
  variant: product.sku.name,
})

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
