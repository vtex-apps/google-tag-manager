import push from './push'

export default function updateEcommerce(
  eventName: string,
  data: Record<string, unknown>
) {
  const eventIndex = window.dataLayer.findIndex(
    gtmEvent => gtmEvent.event && gtmEvent.event === eventName
  )

  if (eventIndex >= 0) {
    window.dataLayer.splice(eventIndex, 1)
  }

  if (Object.keys(data).includes('ecommerce')) {
    const ecommerceNullIndex = window.dataLayer.findIndex(
      gtmEvent => gtmEvent.ecommerce === null
    )

    if (ecommerceNullIndex >= 0) {
      window.dataLayer.splice(ecommerceNullIndex, 1)
    }

    push({ ecommerce: null })
  }

  push(data)
}
