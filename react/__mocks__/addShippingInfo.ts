const cartItem = {
  productId: '200000202',
  skuId: '2000304',
  brand: 'Sony',
  name: 'Top Wood',
  skuName: 'top_wood_200',
  price: 197.99,
  category: 'Home & Decor',
  quantity: 1,
}

export const shippingInfoMock = {
  eventName: 'vtex:addShippingInfo',
  event: 'addShippingInfo',
  items: [cartItem],
  currency: 'USD',
  value: 1958.35,
}
