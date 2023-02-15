import push from './push'

export default function updateEcommerce(
  eventName: string,
  data: Record<string, unknown>
) {
  push({ ecommerce: null, ecommerceV2: null })

  data.event ? push(data) : push({ event: eventName, ...data })
}
