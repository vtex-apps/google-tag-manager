const creditCardPaymentType = {
  group: 'creditCard',
  installments: 1,
  paymentSystemName: 'Mastercard',
  value: 21119,
}

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

export const creditCardPaymentInfo = {
  eventName: 'vtex:addPaymentInfo',
  event: 'addPaymentInfo',
  payment: creditCardPaymentType,
  items: [cartItem],
  currency: 'USD',
}
