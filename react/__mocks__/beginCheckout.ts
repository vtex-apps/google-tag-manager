const cartItem1 = {
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

const cartItem2 = {
  productId: '200000203',
  skuId: '2000305',
  brand: 'Sony',
  name: 'Top Wood 2',
  skuName: 'top_wood_300',
  price: 150.9,
  category: 'Home & Decor/Tables',
  quantity: 3,
  productRefId: '789',
  referenceId: '101',
  variant: 'Blue',
}

export const beginCheckoutMock = {
  eventName: 'vtex:beginCheckout',
  event: 'beginCheckout',
  items: [cartItem1, cartItem2],
  currency: 'USD',
}
