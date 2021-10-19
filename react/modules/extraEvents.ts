import push from './push'
import { PixelMessage, FilterProductsData } from '../typings/events'

export async function sendExtraEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:pageView': {
      push({
        event: 'pageView',
        location: e.data.pageUrl,
        page: e.data.pageUrl.replace(e.origin, ''),
        referrer: e.data.referrer,
        ...(e.data.pageTitle && {
          title: e.data.pageTitle,
        }),
      })

      return
    }

    case 'vtex:userData': {
      const { data } = e

      if (!data.isAuthenticated) {
        return
      }

      push({
        event: 'userData',
        userId: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone
      })

      break
    }

    case 'vtex:sortProducts': {
      push({
        event: 'sortProducts',
        value: e.data.value
      })
      break
    }

    case 'vtex:filterProducts': {
      const { values } = e.data as FilterProductsData
      push({
        event: 'filterProducts',
        values: values
      })
      break
    }

    default: {
      break
    }
  }
}
