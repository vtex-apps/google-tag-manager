import push from './push'
import { PixelMessage } from '../typings/events'

window.dataLayer = window.dataLayer || []


async function emailToHash(email:string) {
  const msgUint8 = new TextEncoder().encode(email);                           
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function sendExtraEvents(e: PixelMessage) {

  const staffObject = window.dataLayer.find(item => item.hasOwnProperty('is_staff'));
  const is_Staff = staffObject.is_staff;

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
      console.log(data, 'data')

      if (!data.isAuthenticated) {
        return
      }

      const emailHash = data.email ? await emailToHash(data.email) : undefined

      push({
        event: 'userData',
        userId: data.id,
        emailHash: emailHash,
        isStaff: is_Staff,
      })

      break
    }

    default: {
      break
    }
  }
}
