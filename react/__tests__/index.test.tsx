import productImpressionData from '../__mocks__/productImpression'
import productDetails from '../__mocks__/productDetail'
import productClick from '../__mocks__/productClick'
import { handleEvents } from '../index'
import push from '../modules/push'

jest.mock('../modules/push', () => jest.fn())

const mockedPush = push as jest.Mock

beforeEach(() => {
  mockedPush.mockReset()
})

test('productImpression', () => {
  const message = new MessageEvent('message', {
    data: productImpressionData,
  })

  handleEvents(message)

  expect(mockedPush).toHaveBeenCalledWith({
    event: 'productImpression',
    ecommerce: {
      currencyCode: 'USD',
      impressions: [
        {
          brand: 'Mizuno',
          category: 'Apparel & Accessories/Shoes',
          id: '35',
          list: 'Shelf',
          name: 'Classic Shoes Top',
          position: 1,
          price: '38.9',
          variant: 'Classic Pink',
        },
        {
          brand: 'Nintendo',
          category: 'Apparel & Accessories/Watches',
          id: '32',
          list: 'Shelf',
          name: 'Gorgeous Top Watch',
          position: 2,
          price: '2200',
          variant: 'Grey',
        },
      ],
    },
  })
})

test('productDetail', () => {
  const message = new MessageEvent('message', {
    data: productDetails,
  })

  handleEvents(message)

  expect(mockedPush).toHaveBeenCalledWith({
    event: 'productDetail',
    ecommerce: {
      detail: {
        products: [
          {
            brand: 'Mizuno',
            category: 'Apparel & Accessories/Shoes',
            id: '35',
            name: 'Classic Shoes Top',
            price: 38.9,
            variant: 'Classic Pink',
          },
        ],
      }
    },
  })
})

test('productClick', () => {
  const message = new MessageEvent('message', {
    data: productClick
  })

  handleEvents(message)

  expect(mockedPush).toHaveBeenCalledWith({
    event: 'productClick',
    ecommerce: {
      click: {
        products: [
          {
            brand: 'Mizuno',
            category: 'Apparel & Accessories/Shoes',
            id: '35',
            name: 'Classic Shoes Top',
            price: 38.9,
            variant: 'Classic Pink',
          }
        ]
      }
    }
  })
})