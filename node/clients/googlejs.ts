import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

const GOOGLE_ROUTE = 'http://www.googletagmanager.com/'

export class GoogleTagManagerScripts extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(GOOGLE_ROUTE, ctx, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Vtex-Use-Https': 'true',
        ...options?.headers,
      },
    })
  }

  public async getScript(scriptName: string, parameters: string) {
    const data = await this.http.get(`/gtag/${scriptName}?${parameters}`)

    return data
  }

  public async getMainScript(scriptName: string, parameters: string) {
    const data = await this.http.get(`/${scriptName}?${parameters}`)

    return data
  }
}
