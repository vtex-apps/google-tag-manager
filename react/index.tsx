import { path } from 'ramda'
import { PixelMessage, Order, ProductOrder } from './typings/events'
import addTagManager from './modules/tagManagerScript'
import push from './modules/push'

addTagManager()

export function handleEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:pageView': {
      push({
        event: 'pageView',
        referrer: e.data.referrer,
        location: e.data.pageUrl,
        page: e.data.pageUrl.replace(e.origin, ''),
        ...(e.data.pageTitle && {
          title: e.data.pageTitle,
        }),
      })
      return
    }
    case 'vtex:productView': {
      const {
        productId,
        productName,
        brand,
        categories,
      } = e.data.product

      const category = path(['0'], categories) as string

      const data = {
        ecommerce: {
          detail: {
            products: [
              {
                brand,
                category: category && category.replace(/^\/|\/$/g, ''),
                id: productId,
                name: productName,
                price: path(['items', '0', 'sellers', '0', 'commertialOffer', 'Price'], e.data.product)
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
      const {
        items
      } = e.data

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
            }))
          },
          currencyCode: e.data.currency,
        },
        event: 'addToCart',
      })
      return
    }
    case 'vtex:removeFromCart': {
      const {
        items
      } = e.data

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
            }))
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
          actionFields: getPurchaseObjectData(order),
          products: order.transactionProducts.map(
            (product: ProductOrder) => getProductObjectData(product)
          ),
        }
      }

      push({
        event: 'orderPlaced',
        ...order,
        ecommerce,
      })

      // Backwards compatible event
      push({
        event: 'pageLoaded',
        ecommerce,
      })
      return
    }
    case 'vtex:productImpression': {
      const { product, currency, position, list } = e.data

      push({
        event: 'productImpression',
        ecommerce: {
          currencyCode: currency,
          impressions: [
            {
              brand: product.brand,
              category: getCategory(product.categories),
              id: product.productId,
              list,
              name: product.productName,
              position,
              price: `${product.sku.seller.commertialOffer.Price}`,
              variant: product.sku.name,
            }
          ]
        }
      })
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
    category: product.category,
    id: product.sku,
    name: product.name,
    price: product.price,
    quantity: product.quantity,
    variant: product.skuName,
  }
}

function getCategory(rawCategories: string[]) {
  if (!rawCategories || !rawCategories.length) return

  const categories = rawCategories.map(function (categoryPath: string) {
    let splitedPath = categoryPath.split('/').filter(Boolean)
    return splitedPath[0]
  })

  return categories ? categories[0] : categories
}

window.addEventListener('message', handleEvents)
