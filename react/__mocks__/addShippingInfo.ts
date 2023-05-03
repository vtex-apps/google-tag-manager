const cartItem = {
  productId: '200000202',
  skuId: '2000304',
  brand: 'Sony',
  name: 'Top Wood',
  skuName: 'top_wood_200',
  price: 197.99,
  category: 'Home & Decor',
  quantity: 1,
  productRefId: '123',
  referenceId: '456',
  variant: 'Red',
}

export const shippingInfoMock = {
  eventName: 'vtex:addShippingInfo',
  event: 'addShippingInfo',
  items: [cartItem],
  currency: 'USD',
  shippingTier: 'Ground',
  value: 1958.35,
}
