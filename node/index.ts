import type { Cached, ClientsConfig, ServiceContext } from '@vtex/api'
import { LRUCache, method, Service } from '@vtex/api'

import { Clients } from './clients'
import { script } from './routes/script'

const TIMEOUT_MS = 4000
const defaultClientOptions = {
  retries: 1,
  timeout: TIMEOUT_MS,
}

const memoryCache = new LRUCache<string, Cached>({ max: 1000 })

declare global {
  type Context = ServiceContext<Clients>
}

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: defaultClientOptions,
    settings: {
      memoryCache,
    },
  },
}

export default new Service({
  clients,
  routes: {
    script: method({
      GET: script,
    }),
  },
})
