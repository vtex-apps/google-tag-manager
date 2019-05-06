import { path } from 'ramda'

import gtmScript from './scripts/gtm'

const gtmId = window.__SETTINGS__.gtmId

if (!gtmId) {
  throw new Error('Warning: No Google Tag Manager ID is defined. To setup this app, take a look at your admin')
}

// tslint:disable-next-line no-eval
eval(gtmScript(window.__SETTINGS__.gtmId))

window.dataLayer = window.dataLayer || []

interface PixelManagerEvent {
  data: {
    eventName: string
    [key: string]: any
  }
}

function handleEvents(e: MessageEvent & PixelManagerEvent) {
  console.log('LISTENED', { data: e.data })

  switch (e.data.eventName) {
    case 'vtex:productView': {
      try {
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
      } catch (e) {
        console.error(e)
      }
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
    default: {
      return
    }
  }
}

window.addEventListener('message', handleEvents)

