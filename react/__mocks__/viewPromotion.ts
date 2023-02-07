import { PromoViewData } from '../typings/events'

const eventType = 'vtex:promoView'
const eventName = 'vtex:promoView'
const event = 'promoView'

const list = 'Shelf'

const position = 1

const promotionId = 'P_12345'
const promotionName = 'Summer Sale'
const promotionCreativeName = 'Summer Banner'
const promotionCreativeSlot = 'featured_app_1'
const promotion = {
  id: promotionId,
  name: promotionName,
  creative: promotionCreativeName,
  position: promotionCreativeSlot,
}

const viewPromotion: PromoViewData = {
  currency: 'USD',
  eventType,
  eventName,
  event,
  list,
  position,
  promotions: [promotion],
  product: {
    productId: '16',
    productName: 'Classic Shoes Top',
    productReference: '12531',
    categories: ['/Apparel & Accessories/Shoes/', '/Apparel & Accessories/'],
    linkText: 'classic-shoes',
    brand: 'Mizuno',
    brandId: '2000010',
    items: [
      {
        ean: '80098',
        name: 'Classic Pink',
        itemId: '35',
        referenceId: {
          Key: 'RefId',
          Value: '12531',
        },
        seller: {
          sellerId: '1',
          sellerDefault: true,
          commertialOffer: {
            PriceWithoutDiscount: 38.9,
            AvailableQuantity: 2000000,
            Price: 38.9,
            ListPrice: 38.9,
          },
        },
        sellers: [
          {
            sellerId: '1',
            sellerDefault: true,
            commertialOffer: {
              PriceWithoutDiscount: 38.9,
              AvailableQuantity: 2000000,
              Price: 38.9,
              ListPrice: 38.9,
            },
          },
        ],
      },
    ],
    sku: {
      ean: '80098',
      name: 'Classic Pink',
      itemId: '35',
      referenceId: {
        Key: 'RefId',
        Value: '12531',
      },
      sellers: [
        {
          sellerId: '1',
          sellerDefault: true,
          commertialOffer: {
            PriceWithoutDiscount: 38.9,
            AvailableQuantity: 2000000,
            Price: 38.9,
            ListPrice: 38.9,
          },
        },
      ],
      seller: {
        sellerId: '1',
        sellerDefault: true,
        commertialOffer: {
          PriceWithoutDiscount: 38.9,
          AvailableQuantity: 2000000,
          Price: 38.9,
          ListPrice: 38.9,
        },
      },
    },
  },
}

export default viewPromotion
