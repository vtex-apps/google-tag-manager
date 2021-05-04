import push from './push'
import {
  Order,
  PixelMessage,
  ProductOrder,
  Impression,
  CartItem,
  AddToCartData,
  RemoveToCartData,
  ProductViewData,
  Seller,
  ProductClickData,
} from '../typings/events'
import { AnalyticsEcommerceProduct } from '../typings/gtm'

function getSeller(sellers: Seller[]) {
  const defaultSeller = sellers.find(seller => seller.sellerDefault)

  if (!defaultSeller) {
    return sellers[0]
  }

  return defaultSeller
}

export async function sendEnhancedEcommerceEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:productView': {
      const {
        productId,
        selectedSku,
        productName,
        brand,
        categories,
      } = (e.data as ProductViewData).product

      // Product summary list title. Ex: 'List of products'
      const list = e.data.list ? { actionField: { list: e.data.list } } : {}

      let price

      try {
        price = getSeller(e.data.product.items[0].sellers).commertialOffer.Price
      } catch {
        price = undefined
      }

      const data = {
        ecommerce: {
          detail: {
            ...list,
            products: [
              {
                brand,
                category: getCategory(categories),
                id: productId,
                skuId: selectedSku.itemId,
                name: productName,
                variant: selectedSku.name,
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

    case 'vtex:productClick': {
      const { product, position } = e.data as ProductClickData
      const { productName, brand, categories, sku, productId } = product

      // Product summary list title. Ex: 'List of products'
      const list = e.data.list ? { actionField: { list: e.data.list } } : {}

      let price

      try {
        price = getSeller(product.items[0].sellers).commertialOffer.Price
      } catch {
        price = undefined
      }

      const data = {
        event: 'productClick',
        ecommerce: {
          click: {
            ...list,
            position,
            products: [
              {
                brand,
                category: getCategory(categories),
                id: productId,
                skuId: sku.itemId,
                name: productName,
                variant: sku.name,
                price,
              },
            ],
          },
        },
      }

      push(data)

      return
    }

    case 'vtex:addToCart': {
      const { items } = e.data as AddToCartData

      push({
        ecommerce: {
          add: {
            products: items.map(item => ({
              brand: item.brand,
              category: item.category,
              id: item.productId,
              skuId: item.skuId,
              name: item.name, // Product name
              price:
                item.priceIsInt === true
                  ? `${item.price / 100}`
                  : `${item.price}`,
              quantity: item.quantity,
              variant: item.variant, // SKU name (variant)
            })),
          },
          currencyCode: e.data.currency,
        },
        event: 'addToCart',
      })

      return
    }

    case 'vtex:removeFromCart': {
      const { items } = e.data as RemoveToCartData

      push({
        ecommerce: {
          currencyCode: e.data.currency,
          remove: {
            products: items.map(item => ({
              brand: item.brand,
              category: item.category,
              id: item.productId,
              skuId: item.skuId,
              name: item.name, // Product name
              price:
                item.priceIsInt === true
                  ? `${item.price / 100}`
                  : `${item.price}`,
              quantity: item.quantity,
              variant: item.variant, // SKU name (variant)
            })),
          },
        },
        event: 'removeFromCart',
      })

      return
    }

    case 'vtex:orderPlaced': {
      const order = e.data

      const ecommerce = {
        purchase: {
          actionField: getPurchaseObjectData(order),
          products: order.transactionProducts.map((product: ProductOrder) =>
            getProductObjectData(product)
          ),
        },
      }

      push({
        // @ts-ignore
        event: 'orderPlaced',
        ...order,
        ecommerce,
      })

      // should we keep it?
      // Backwards compatible event
      push({
        ecommerce,
        event: 'pageLoaded',
      })

      return
    }

    case 'vtex:productImpression': {
      const { currency, list, impressions, product, position } = e.data
      let oldImpresionFormat: Record<string, any> | null = null

      // should we keep it?
      if (product != null && position != null) {
        // make it backwards compatible
        oldImpresionFormat = [
          getProductImpressionObjectData(list)({
            product,
            position,
          }),
        ]
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

      return
    }

    case 'vtex:cartLoaded': {
      const { orderForm } = e.data

      push({
        event: 'checkout',
        ecommerce: {
          checkout: {
            actionField: {
              step: 1,
            },
            products: orderForm.items.map(getCheckoutProductObjectData),
          },
        },
      })

      break
    }

    case 'vtex:promoView': {
      const { promotions } = e.data

      push({
        event: 'promoView',
        ecommerce: {
          promoView: {
            promotions,
          },
        },
      })
      break
    }

    case 'vtex:promotionClick': {
      const { promotions } = e.data

      push({
        event: 'promotionClick',
        ecommerce: {
          promoClick: {
            promotions,
          },
        },
      })
      break
    }

    default: {
      break
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
    category: product.categoryTree?.join('/'),
    id: product.id, // Product id
    skuId: product.sku, // SKU id
    name: product.name, // Product name
    price: product.price,
    quantity: product.quantity,
    variant: product.skuName, // SKU name (only variant)
  }
}

function getCategory(rawCategories: string[]) {
  if (!rawCategories || !rawCategories.length) {
    return
  }

  return removeStartAndEndSlash(rawCategories[0])
}

// Transform this: "/Apparel & Accessories/Clothing/Tops/"
// To this: "Apparel & Accessories/Clothing/Tops"
function removeStartAndEndSlash(category?: string) {
  return category?.replace(/^\/|\/$/g, '')
}

function getProductImpressionObjectData(list: string) {
  return ({ product, position }: Impression) => ({
    brand: product.brand,
    category: getCategory(product.categories),
    id: product.productId, // Product id
    skuId: product.sku.itemId, // SKU id
    list,
    name: product.productName,
    position,
    price: `${product.sku.seller.commertialOffer.Price}`,
    variant: product.sku.name, // SKU name (variation only)
  })
}

function getCheckoutProductObjectData(
  item: CartItem
): AnalyticsEcommerceProduct {
  const productName = getProductNameWithoutVariant(item.name, item.skuName)

  return {
    id: item.productId, // Product id
    skuId: item.id, // SKU id
    name: productName, // Product name without variant
    category: Object.keys(item.productCategories ?? {}).reduce(
      (categories, category) =>
        categories ? `${categories}/${category}` : category,
      ''
    ),
    brand: item.additionalInfo?.brandName ?? '',
    variant: item.skuName,
    price: item.sellingPrice / 100,
    quantity: item.quantity,
  }
}

function getProductNameWithoutVariant(
  productNameWithVariant: string,
  variant: string
) {
  const indexOfVariant = productNameWithVariant.lastIndexOf(variant)

  if (indexOfVariant === -1 || indexOfVariant === 0) {
    return productNameWithVariant
  }

  return productNameWithVariant.substring(0, indexOfVariant - 1) // Removes the variant and the whitespace
}
