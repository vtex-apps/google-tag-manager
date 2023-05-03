const cartItem1 = {
  productId: '200000202',
  skuId: '2000304',
  additionalInfo: {
    brandName: 'Sony',
  },
  name: 'Top Wood',
  skuName: 'top_wood_200',
  price: 19799,
  productCategories: {
    '25': 'Home & Decor',
  },
  productCategoryIds: '/25/',
  quantity: 2,
  productRefId: '123',
  referenceId: '456',
  variant: 'Red',
}

const cartItem2 = {
  productId: '200000203',
  skuId: '2000305',
  additionalInfo: {
    brandName: 'Sony',
  },
  name: 'Top Wood 2',
  skuName: 'top_wood_300',
  price: 15090,
  productCategories: {
    '25': 'Home & Decor',
    '32': 'Tables',
  },
  productCategoryIds: '/25/32/',
  quantity: 1,
  productRefId: '789',
  referenceId: '101',
  variant: 'Blue',
}

export const viewCartWithItemsMock = {
  eventName: 'vtex:viewCart',
  event: 'viewCart',
  items: [cartItem1, cartItem2],
  currency: 'USD',
}

export const viewCartWithNoItemsMock = {
  eventName: 'vtex:viewCart',
  event: 'viewCart',
  items: [],
  currency: 'USD',
}
