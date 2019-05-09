import { path } from 'ramda'

type EventType =
  | 'vtex:homeView'
  | 'vtex:productView'
  | 'vtex:productClick'
  | 'vtex:otherView'
  | 'vtex:categoryView'
  | 'vtex:departmentView'
  | 'vtex:internalSiteSearchView'
  | 'vtex:pageInfo'
  | 'vtex:pageView'
  | 'vtex:addToCart'
  | 'vtex:removeFromCart'
  | 'vtex:pageComponentInteraction'
  | 'vtex:orderPlaced'

interface PixelManagerEvent extends MessageEvent {
  data: Data
}

interface Data {
  eventName: EventType,
  [key: string]: any
}

const gtmId = window.__SETTINGS__.gtmId

if (!gtmId) {
  throw new Error('Warning: No Google Tag Manager ID is defined. To setup this app, take a look at your admin')
}

// GTM script snippet. Taken from: https://developers.google.com/tag-manager/quickstart
/* tslint:disable */
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',gtmId)
/* tslint:enable */

window.dataLayer = window.dataLayer || []

function handleEvents(e: PixelManagerEvent) {
  switch (e.data.eventName) {
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
      }

      window.dataLayer.push(data)
      return
    }
    case 'vtex:addToCart': {
      const {
        items
      } = e.data

      window.dataLayer.push({
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

      window.dataLayer.push({
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

      window.dataLayer.push({
        event: 'orderPlaced',
        ...order,
      })

      window.dataLayer.push({
        ecommerce: {
          purchase: {
            actionFields: getPurchaseObjectData(order),
            products: order.transactionProducts.map(
              (product: Product) => getProductObjectData(product)
            ),
          }
        },
        event: 'pageLoaded',
      })
    }
    default: {
      return
    }
  }
}

interface Order extends Data {
  currency: string
  accountName: string
  orderGroup: string
  salesChannel: string
  coupon: string
  visitorType: string
  visitorContactInfo: string[]
  transactionId: string
  transactionDate: string
  transactionAffiliation: string
  transactionTotal: number,
  transactionShipping: number,
  transactionTax: number,
  transactionCurrency: string,
  transactionPaymentType: PaymentType[],
  transactionShippingMethod: ShippingMethod[]
  transactionProducts: Product[]
  transactionPayment: {
    id: string
  }
}

interface PaymentType {
  group: string
  paymentSystemName: string
  installments: number
  value: number
}

interface ShippingMethod {
  itemId: string
  selectedSla: string
}

interface Product {
  id: string,
  name: string,
  sku: string,
  skuRefId: string,
  skuName: string,
  brand: string,
  brandId: string,
  seller: string,
  sellerId: string,
  category: string,
  categoryId: string,
  categoryTree: string[]
  categoryIdTree: string[]
  originalPrice: number
  price: number
  sellingPrice: number
  tax: number
  quantity: number
  components: any[]
  measurementUnit: string
  unitMultiplier: number
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

function getProductObjectData(product: Product) {
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

window.addEventListener('message', handleEvents)
