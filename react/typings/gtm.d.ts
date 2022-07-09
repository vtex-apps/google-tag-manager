export interface AnalyticsEcommerceProduct {
  id: string
  name: string
  category: string
  brand: string
  variant: string
  price: number
  quantity: number
  dimension1: string
  dimension2: string
  dimension3: string
}

export interface MaybePrice {
  price?: number
}
