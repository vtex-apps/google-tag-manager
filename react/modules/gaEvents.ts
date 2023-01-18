import { PixelMessage } from '../typings/events'
import updateEcommerce from './updateEcommerce'

export const shouldMergeUAEvents = () => Boolean(window?.__gtm__?.mergeUAEvents)

export function viewItem(event: PixelMessage) {
  if (!shouldMergeUAEvents()) return

  const eventName = 'view_item'

  const data = {
    event: eventName,
    ...event,
  }

  updateEcommerce(eventName, data)
}
