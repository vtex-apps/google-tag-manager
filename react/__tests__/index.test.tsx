import productImpressionData from '../__mocks__/productImpression'
import productDetails from '../__mocks__/productDetail'
import productClick from '../__mocks__/productClick'
import { buildViewPromotionData } from '../__mocks__/viewPromotion'
import { handleEvents } from '../index'
import updateEcommerce from '../modules/updateEcommerce'
import {
  Promotion,
  PromotionClickData,
  AddToCartData,
  RemoveFromCartData,
  CartItem,
} from '../typings/events'
import { creditCardPaymentInfoMock } from '../__mocks__/addPaymentInfo'
import shouldSendGA4Events from '../modules/utils/shouldSendGA4Events'
import { beginCheckoutMock } from '../__mocks__/beginCheckout'
import {
  viewCartWithItemsMock,
  viewCartWithNoItemsMock,
} from '../__mocks__/viewCart'

jest.mock('../modules/utils/shouldSendGA4Events')

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
        actionField: {
          list: 'List of products',
        },
        products: [
          {
            brand: 'Mizuno',
            category: 'Apparel & Accessories/Shoes',
            id: '16',
            variant: '35',
            name: 'Classic Shoes Top',
            price: 1540.99,
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
        actionField: {
          list: 'List of products',
        },
        products: [
          {
            brand: 'Mizuno',
            category: 'Apparel & Accessories/Shoes',
            id: '16',
            variant: '35',
            name: 'Classic Shoes Top',
            position: 3,
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
  const sendGA4Events = true
  const mockedShouldSendGA4Events = shouldSendGA4Events as jest.Mock

  beforeEach(() => {
    mockedShouldSendGA4Events.mockReset()
    mockedShouldSendGA4Events.mockReturnValue(sendGA4Events)
  })

  describe('view_item_list', () => {
    it('sends an event that signifies that some content was shown to the user', () => {
      const message = new MessageEvent('message', {
        data: productImpressionData,
      })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('view_item_list', {
        ecommerce: {
          item_list_name: 'Shelf',
          items: [
            {
              discount: 0,
              index: 1,
              item_brand: 'Mizuno',
              item_category: 'Apparel & Accessories',
              item_category2: 'Shoes',
              item_id: '16',
              item_name: 'Classic Shoes Top',
              item_variant: '35',
              price: 38.9,
              quantity: 2000000,
            },
            {
              discount: 0,
              index: 2,
              item_brand: 'Nintendo',
              item_category: 'Apparel & Accessories',
              item_category2: 'Watches',
              item_id: '15',
              item_name: 'Gorgeous Top Watch',
              item_variant: '32',
              price: 2200,
              quantity: 2000000,
            },
          ],
        },
      })
    })
  })

  describe('view_item', () => {
    it('sends an event that signifies that some content was shown to the user', () => {
      const message = new MessageEvent('message', { data: productDetails })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('view_item', {
        ecommerce: {
          currency: 'USD',
          value: 1540.99,
          items: [
            {
              item_id: '16',
              item_name: 'Classic Shoes Top',
              item_list_name: 'List of products',
              item_brand: 'Mizuno',
              item_variant: '35',
              price: 1540.99,
              quantity: 2000000,
              discount: 0,
              item_category: 'Apparel & Accessories',
              item_category2: 'Shoes',
            },
          ],
        },
      })
    })
  })

  describe('select_item', () => {
    it('sends an event that signifies an item was selected from a list', () => {
      const message = new MessageEvent('message', { data: productClick })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('select_item', {
        ecommerce: {
          item_list_name: 'List of products',
          items: [
            {
              item_id: '16',
              item_name: 'Classic Shoes Top',
              item_list_name: 'List of products',
              item_brand: 'Mizuno',
              item_variant: '35',
              index: 3,
              price: 38.9,
              quantity: 2000000,
              discount: 0,
              item_category: 'Apparel & Accessories',
              item_category2: 'Shoes',
            },
          ],
        },
      })
    })
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
        ecommerce: {
          creative_name: 'Summer Banner',
          creative_slot: 'featured_app_1',
          promotion_id: 'P_12345',
          promotion_name: 'Summer Sale',
        },
      })
    })
  })

  describe('add_to_cart', () => {
    it('sends an event that signifies an item being added to the cart', () => {
      type CartItemMockType = Pick<
        CartItem,
        | 'name'
        | 'brand'
        | 'price'
        | 'skuId'
        | 'skuName'
        | 'quantity'
        | 'category'
        | 'productId'
      >

      const cartItem1: CartItemMockType = {
        productId: '200000202',
        skuId: '2000304',
        brand: 'Sony',
        name: 'Top Wood',
        skuName: 'top_wood_200',
        price: 197.99,
        category: 'Home & Decor',
        quantity: 1,
      }

      const cartItem2: CartItemMockType = {
        productId: '200000203',
        skuId: '2000305',
        brand: 'Sony',
        name: 'Top Wood 2',
        skuName: 'top_wood_300',
        price: 150.9,
        category: 'Home & Decor/Tables',
        quantity: 1,
      }

      const data: AddToCartData = {
        currency: 'USD',
        event: 'addToCart',
        eventName: 'vtex:addToCart',
        items: [cartItem1 as CartItem, cartItem2 as CartItem],
      }

      const message = new MessageEvent('message', { data })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('add_to_cart', {
        ecommerce: {
          currency: 'USD',
          value: 348.89,
          items: [
            {
              item_id: '200000202',
              item_brand: 'Sony',
              item_name: 'Top Wood',
              item_variant: '2000304',
              item_category: 'Home & Decor',
              quantity: 1,
              price: 197.99,
            },
            {
              item_id: '200000203',
              item_brand: 'Sony',
              item_name: 'Top Wood 2',
              item_variant: '2000305',
              item_category: 'Home & Decor',
              item_category2: 'Tables',
              quantity: 1,
              price: 150.9,
            },
          ],
        },
      })
    })
  })

  describe('remove_from_cart', () => {
    it('sends an event that signifies an item being removed from cart', () => {
      type CartItemMockType = Pick<
        CartItem,
        | 'name'
        | 'brand'
        | 'price'
        | 'skuId'
        | 'skuName'
        | 'quantity'
        | 'category'
        | 'productId'
      >

      const cartItem: CartItemMockType = {
        productId: '200000202',
        skuId: '2000304',
        brand: 'Sony',
        name: 'Top Wood',
        skuName: 'top_wood_200',
        price: 197.99,
        category: 'Home & Decor',
        quantity: 1,
      }

      const data: RemoveFromCartData = {
        currency: 'USD',
        event: 'removeFromCart',
        eventName: 'vtex:removeFromCart',
        items: [cartItem as CartItem],
      }

      const message = new MessageEvent('message', { data })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('remove_from_cart', {
        ecommerce: {
          currency: 'USD',
          value: 197.99,
          items: [
            {
              item_id: '200000202',
              item_brand: 'Sony',
              item_name: 'Top Wood',
              item_variant: '2000304',
              item_category: 'Home & Decor',
              quantity: 1,
              price: 197.99,
            },
          ],
        },
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
        ecommerce: {
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
        },
      })
    })
  })

  describe('view_promotion', () => {
    it('sends an event that signifies a promotion was viewed from a list', () => {
      const data = buildViewPromotionData({
        id: 'P_12345',
        name: 'Summer Sale',
        creative: 'Summer Banner',
        position: 'featured_app_1',
        products: [
          {
            productId: 'SKU_20',
            productName: 'Tea Leaves',
          },
          {
            productId: 'SKU_30',
            productName: 'Coffee Beans',
          },
        ],
      })

      const message = new MessageEvent('message', { data })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('view_promotion', {
        ecommerce: {
          creative_name: 'Summer Banner',
          creative_slot: 'featured_app_1',
          promotion_id: 'P_12345',
          promotion_name: 'Summer Sale',
          items: [
            {
              item_id: 'SKU_20',
              item_name: 'Tea Leaves',
            },
            {
              item_id: 'SKU_30',
              item_name: 'Coffee Beans',
            },
          ],
        },
      })
    })
  })

  describe('add_payment_info', () => {
    it('sends an event when a user add a payment information (credit card)', () => {
      const data = creditCardPaymentInfoMock

      const message = new MessageEvent('message', { data })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('add_payment_info', {
        ecommerce: {
          currency: 'USD',
          value: 211.19,
          payment_type: 'creditCard',
          items: [
            {
              item_id: '200000202',
              item_brand: 'Sony',
              item_name: 'Top Wood',
              item_variant: '2000304',
              item_category: 'Home & Decor',
              quantity: 1,
              price: 197.99,
            },
          ],
        },
      })
    })
  })

  describe('begin_checkout', () => {
    it('sends an event when a user access the checkout page', () => {
      const data = beginCheckoutMock

      const message = new MessageEvent('message', { data })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('begin_checkout', {
        ecommerce: {
          currency: 'USD',
          value: 348.89,
          items: [
            {
              item_id: '200000202',
              item_brand: 'Sony',
              item_name: 'Top Wood',
              item_variant: '2000304',
              item_category: 'Home & Decor',
              quantity: 1,
              price: 197.99,
            },
            {
              item_id: '200000203',
              item_brand: 'Sony',
              item_name: 'Top Wood 2',
              item_variant: '2000305',
              item_category: 'Home & Decor',
              item_category2: 'Tables',
              quantity: 1,
              price: 150.9,
            },
          ],
        },
      })
    })
  })
  describe('view_cart', () => {
    it('sends an event when a user opens the cart with items', () => {
      const data = viewCartWithItemsMock

      const message = new MessageEvent('message', { data })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('view_cart', {
        ecommerce: {
          currency: 'USD',
          value: 348.89,
          items: [
            {
              item_id: '200000202',
              item_brand: 'Sony',
              item_name: 'Top Wood',
              item_variant: '2000304',
              item_category: 'Home & Decor',
              quantity: 1,
              price: 197.99,
            },
            {
              item_id: '200000203',
              item_brand: 'Sony',
              item_name: 'Top Wood 2',
              item_variant: '2000305',
              item_category: 'Home & Decor',
              item_category2: 'Tables',
              quantity: 1,
              price: 150.9,
            },
          ],
        },
      })
    })
    it('sends an event when a user opens the cart with no items', () => {
      const data = viewCartWithNoItemsMock

      const message = new MessageEvent('message', { data })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('view_cart', {
        ecommerce: {
          currency: 'USD',
          value: 0.0,
          items: [],
        },
      })
    })
  })
  describe('login', () => {
    it('sends an event when a user login on store with any method', () => {
      const data = {
        event: 'login',
        eventName: 'vtex:login',
        method: 'Google',
      }

      const message = new MessageEvent('message', { data })

      handleEvents(message)

      expect(mockedUpdate).toHaveBeenCalledWith('login', {
        ecommerce: {
          method: 'Google',
        },
      })
    })
  })
})
