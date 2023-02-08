import push from './push'

export default function updateGA4Ecommerce(
  event: string,
  data: Record<string, unknown>
) {
  push({ ecommerce: null })

  push({
    event,
    ecommerce: data,
  })
}
