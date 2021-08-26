import push from './push'
import { PixelMessage } from '../typings/events'

export async function sendExtraEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:pageView': {
      push({
        event: 'pageView',
        location: e.data.pageUrl,
        page: e.data.pageUrl.replace(e.origin, ''),
        referrer: e.data.referrer ? e.data.referrer : sessionStorage.getItem('gtmRefferer') ? sessionStorage.getItem('gtmRefferer') : '',
        ...(e.data.pageTitle && {
          title: e.data.pageTitle,
        }),
      })

      sessionStorage.setItem('gtmRefferer', e.data.pageUrl);

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
      })

      break
    }

    default: {
      break
    }
  }
}
