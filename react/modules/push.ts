import { createOrGetAnalyticsData } from './analytics'

window.dataLayer = window.dataLayer || []

export default function push(rawEvent: Record<string, unknown>) {
  const {
    location: originalLocation,
    referrer: originalReferrer,
    origin,
  } = createOrGetAnalyticsData()

  let event = rawEvent

  if (window.dataLayer.length === 0 || origin === 'fresh') {
    event = {
      ...rawEvent,
      originalLocation,
      originalReferrer,
    }
  }

  window.dataLayer.push(event)
}
