import productImpressionData from '../__mocks__/productImpression'
import { handleEvents } from '../index'
import push from '../modules/push'

jest.mock('../modules/push', () => jest.fn())

test('productImpression', () => {
  const message = new MessageEvent('message', {
    data: productImpressionData,
  })

  handleEvents(message)

  expect(push).toHaveBeenCalledWith({
    event: 'productImpression',
    ecommerce: {
      currencyCode: 'USD',
      impressions: [
        {
          name: 'Long Sleeve Shirt - Regular',
          id: '2000005',
          price: '9450',
          brand: 'Apple',
          category: 'Clothing',
          variant: 'Regular',
          list: 'Shelf',
          position: 3,
        },
      ],
    },
  })
})

test('promoView', () => {
  const promotions = [{
    'id': 'JUNE_PROMO13',
    'name': 'June Sale',
    'creative': 'banner1',
    'position': 'slot1'
  },
  {
    'id': 'FREE_SHIP13',
    'name': 'Free Shipping Promo',
    'creative': 'skyscraper1',
    'position': 'slot2'
  }]
  const message = new MessageEvent('message', {
    data: {
      eventName: 'vtex:promoView',
      event: 'promoView',
      promotions,
    }
  })

  handleEvents(message)

  expect(push).toHaveBeenCalledWith({
    ecommerce: {
      promoView: {
        promotions,
      }
    },
  })
})

test('promotionClick', () => {
  const promotions = [{
    'id': 'JUNE_PROMO13',
    'name': 'June Sale',
    'creative': 'banner1',
    'position': 'slot1'
  }]
  const message = new MessageEvent('message', {
    data: {
      eventName: 'vtex:promotionClick',
      event: 'promotionClick',
      promotions,
    }
  })

  handleEvents(message)

  expect(push).toHaveBeenCalledWith({
    event: 'promotionClick',
    ecommerce: {
      promoClick: {
        promotions,
      }
    },
  })
})
