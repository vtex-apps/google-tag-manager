import {
  AnalyticsData,
  AnalyticsDataWithOrigin,
  currentDateInSeconds,
  getAnalyticsFromStorage,
  isStorageExpired,
  renewExpirationDate,
  saveAnalyticsOnStorage,
  shouldInvalidateCurrentCampaign,
} from './utils'

export function createOrGetAnalyticsData(): AnalyticsDataWithOrigin {
  let analyticsData = getAnalyticsData()
  let origin: AnalyticsDataWithOrigin['origin'] = 'storage'

  if (!analyticsData) {
    analyticsData = createAnalyticsData()
    origin = 'fresh'
  }

  saveAnalyticsOnStorage(analyticsData)

  return { ...analyticsData, origin }
}

function getAnalyticsData(): AnalyticsData | null {
  const analyticsFromStorage = getAnalyticsFromStorage()

  if (
    !analyticsFromStorage ||
    isStorageExpired(analyticsFromStorage.expires, currentDateInSeconds()) ||
    shouldInvalidateCurrentCampaign(window.location, document.referrer)
  ) {
    return null
  }

  return {
    ...analyticsFromStorage,
    expires: renewExpirationDate(),
  }
}

function createAnalyticsData(): AnalyticsData {
  return {
    location: window.location.href,
    referrer: document.referrer,
    expires: renewExpirationDate(),
  }
}
