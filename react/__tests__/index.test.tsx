import { handleEvents } from '../index'
import productImpressionData from '../__mocks__/productImpression'
import push from '../modules/push'

jest.mock('../modules/tagManagerScript', () => jest.fn())
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
