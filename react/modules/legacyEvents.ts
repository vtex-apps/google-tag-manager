import push from './push'
import { PixelMessage, SearchPageInfoData } from '../typings/events'

export async function sendLegacyEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:pageInfo': {
      const { eventType } = e.data

      switch (eventType) {
        case 'homeView': {
          push({
            event: 'homeView',
          })
          break
        }

        case 'categoryView': {
          const data = e.data as SearchPageInfoData

          push({
            event: 'categoryView',
            departmentId: data.department?.id,
            departmentName: data.department?.name,
            categoryId: data.category?.id,
            categoryName: data.category?.name,
          })
          break
        }

        case 'departmentView': {
          const data = e.data as SearchPageInfoData

          push({
            event: 'departmentView',
            departmentId: data.department?.id,
            departmentName: data.department?.name,
          })
          break
        }

        case 'emptySearchView':

        // eslint-disable-next-line no-fallthrough
        case 'internalSiteSearchView': {
          const data = e.data as SearchPageInfoData

          push({
            event: 'internalSiteSearchView',
            siteSearchTerm: data.search?.term,
            siteSearchForm: window.location.href,
            siteSearchCategory: data.search?.category?.id,
            siteSearchResults: data.search?.results,
          })

          break
        }

        case 'productView': {
          push({
            event: 'productView',
            product: e.data.product
          })
          break
        }

        default: {
          push({
            event: 'otherView',
          })
          break
        }
      }

      break
    }

    default: {
      break
    }
  }
}
