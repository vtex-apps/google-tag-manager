// Almost all of the logic of expiration and campaign invalidation is based on this official GA article https://support.google.com/analytics/answer/2731565

export interface AnalyticsData {
  location: string
  referrer: string
  expires: number
}

export interface AnalyticsDataWithOrigin extends AnalyticsData {
  origin: 'storage' | 'fresh'
}

export const UTM_SOURCE_PARAM = 'utm_source'
export const UTM_MEDIUM_PARAM = 'utm_medium'

// All of these parameters trigger a new session storage of the url
// This list was inspired by Simo Ahava's list used on his cookie implementation of this feature
// https://www.simoahava.com/analytics/persist-campaign-data-landing-page/#setup-the-persist-campaign-data-tag
export const analyticsURLParams = [
  UTM_SOURCE_PARAM,
  UTM_MEDIUM_PARAM,
  'utm_campaign',
  'gclid',
  'utm_term',
  'utm_content',
  'utm_id',
] as const

export const keyValueToParam = (key: string, value: string) => `${key}=${value}`

export function shouldInvalidateCurrentCampaign(
  location: Location,
  referrer: string
) {
  const referrerURL = referrer ? new URL(referrer) : null

  // if user comes from a referring website
  if (referrerURL && referrerURL.host !== location.host) {
    return true
  }

  // the slice removes the initial "?" character
  const individualLocationParams = location.search.slice(1).split('&')

  return individualLocationParams.some(locationParam => {
    return analyticsURLParams.some(campaignParam =>
      locationParam.startsWith(`${campaignParam}=`)
    )
  })
}

const STORAGE_KEY_ANALYTICS_DATA = 'analytics:session'

export function getAnalyticsFromStorage(): AnalyticsData | null {
  let analyticsData = null

  try {
    const rawAnalyticsData = window.localStorage.getItem(
      STORAGE_KEY_ANALYTICS_DATA
    )

    analyticsData = rawAnalyticsData ? JSON.parse(rawAnalyticsData) : null
  } catch (e) {
    console.error(
      'Error while fetching original browser location from localStorage storage'
    )
  }

  return analyticsData
}

export async function saveAnalyticsOnStorage(analyticsData: AnalyticsData) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY_ANALYTICS_DATA,
      JSON.stringify(analyticsData)
    )
  } catch (e) {
    console.error(
      'Error while saving original browser location on localStorage storage'
    )
  }
}

export function currentDateInSeconds() {
  return Math.floor(Date.now() / 1000)
}

export const THIRTY_MIN_IN_SECONDS = 1800

export function isStorageExpired(expiresIn: number, now: number) {
  return now - expiresIn > 0
}

export function renewExpirationDate() {
  return currentDateInSeconds() + THIRTY_MIN_IN_SECONDS
}
