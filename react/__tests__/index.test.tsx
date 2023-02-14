import productImpressionData from '../__mocks__/productImpression'
import productDetails from '../__mocks__/productDetail'
import productClick from '../__mocks__/productClick'
import { handleEvents } from '../index'
import updateEcommerce from '../modules/updateEcommerce'
import { Promotion, PromotionClickData } from '../typings/events'
import shouldMergeUAEvents from '../modules/utils/shouldMergeUAEvents'

jest.mock('../modules/utils/shouldMergeUAEvents')

jest.mock('../modules/updateEcommerce', () => jest.fn())

const mockedUpdate = updateEcommerce as jest.Mock

beforeEach(() => {
  mockedUpdate.mockReset()
})

test('productImpression', () => {
  const message = new MessageEvent('message', {
    data: productImpressionData,
  })

  handleEvents(message)

  expect(mockedUpdate).toHaveBeenCalledWith('productImpression', {
    event: 'productImpression',
    ecommerce: {
      currencyCode: 'USD',
      impressions: [
        {
          brand: 'Mizuno',
          category: 'Apparel & Accessories/Shoes',
          id: '16',
          variant: '35',
          list: 'Shelf',
          name: 'Classic Shoes Top',
          position: 1,
          price: '38.9',
          dimension1: '12531',
          dimension2: '232344',
          dimension3: 'Classic Pink',
        },
        {
          brand: 'Nintendo',
          category: 'Apparel & Accessories/Watches',
          id: '15',
          variant: '32',
          list: 'Shelf',
          name: 'Gorgeous Top Watch',
          position: 2,
          price: '2200',
          dimension1: '',
          dimension2: '',
          dimension3: 'Grey',
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

  expect(updateEcommerce).toHaveBeenCalledWith('productDetail', {
    event: 'productDetail',
    ecommerce: {
      detail: {
        products: [
          {
            brand: 'Mizuno',
            category: 'Apparel & Accessories/Shoes',
            id: '16',
            variant: '35',
            name: 'Classic Shoes Top',
            price: 38.9,
            dimension1: '',
            dimension2: '12531',
            dimension3: 'Classic Pink',
            dimension4: 'available',
          },
        ],
      },
    },
  })
})

test('productClick', () => {
  const message = new MessageEvent('message', {
    data: productClick,
  })

  handleEvents(message)

  expect(mockedUpdate).toHaveBeenCalledWith('productClick', {
    event: 'productClick',
    ecommerce: {
      click: {
        products: [
          {
            brand: 'Mizuno',
            category: 'Apparel & Accessories/Shoes',
            id: '16',
            variant: '35',
            name: 'Classic Shoes Top',
            price: 38.9,
            dimension1: '12531',
            dimension2: '',
            dimension3: 'Classic Pink',
          },
        ],
      },
    },
  })
})

describe('GA4 events', () => {
  const mergeUAEvents = true
  const mockedShouldMergeUAEvents = shouldMergeUAEvents as jest.Mock

  beforeEach(() => {
    mockedShouldMergeUAEvents.mockReset()
    mockedShouldMergeUAEvents.mockReturnValue(mergeUAEvents)
  })

  describe('select_promotion', () => {
    it('sends an event that signifies a promotion was selected from a list', () => {
      const promotion: Promotion = {
        id: 'P_12345',
        name: 'Summer Sale',
        creative: 'Summer Banner',
        position: 'featured_app_1',
      }

      const data: PromotionClickData = {
        currency: 'USD',
        event: 'promotionClick',
        eventName: 'vtex:promotionClick',
        eventType: 'vtex:promotionClick',
        promotions: [promotion],
      }

      const message = new MessageEvent('message', { data })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('select_promotion', {
        creative_name: 'Summer Banner',
        creative_slot: 'featured_app_1',
        promotion_id: 'P_12345',
        promotion_name: 'Summer Sale',
      })
    })
  })

  describe('purchase', () => {
    it('sends an event that signifies a successful checkout on orderPlaced page', () => {
      const transactionProducts = [
        {
          attachments: [],
          brand: 'New Offers!!',
          brandId: '2000045',
          category: 'Apparel & Accessories',
          categoryId: '25',
          categoryIdTree: ['25'],
          categoryTree: ['Apparel & Accessories'],
          components: [],
          ean: '9812983',
          id: '9',
          measurementUnit: 'un',
          name: 'Top Everyday Necessaire 100 RMS',
          originalPrice: 1600.99,
          price: 1600.99,
          priceTags: [],
          productRefId: '',
          quantity: 1,
          seller: 'VTEX',
          sellerId: '1',
          sellingPrice: 1600.99,
          sku: '20',
          skuName: '100 RMS',
          skuRefId: '9812983',
          slug: 'everyday-necessaire',
          tax: 0,
          unitMultiplier: 1,
        },
      ]

      const data = {
        accountName: 'storecomponents',
        corporateName: null,
        currency: 'USD',
        event: 'orderPlaced',
        eventName: 'vtex:orderPlaced',
        openTextField: null,
        orderGroup: '1310750551387',
        ordersInOrderGroup: ['1310750551387-01'],
        salesChannel: '1',
        transactionAffiliation: 'VTEX',
        transactionCurrency: 'USD',
        transactionCustomTaxes: {},
        transactionDate: '2023-02-14T18:56:47.0019167Z',
        transactionDiscounts: 0,
        transactionId: '1310750551387',
        transactionLatestShippingEstimate: '2023-02-15T18:56:52.1493235Z',
        transactionPayment: { id: 'FCE420A6B22C45D3BD60FD5DB55D34D1' },
        transactionShipping: 1942.61,
        transactionProducts,
        transactionSubtotal: 1600.99,
        transactionTax: 0,
        transactionTotal: 3543.6,
      }

      const message = new MessageEvent('message', { data })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('purchase', {
        coupon: null,
        currency: 'USD',
        items: [
          {
            item_brand: 'New Offers!!',
            item_category: 'Apparel & Accessories',
            item_id: '9',
            item_name: 'Top Everyday Necessaire',
            item_variant: '20',
            price: 1600.99,
            quantity: 1,
          },
        ],
        shipping: 1942.61,
        tax: 0,
        transaction_id: '1310750551387',
        value: 3543.6,
      })
    })
  })
})
