import { IOClients } from '@vtex/api'

import { GoogleTagManagerScripts } from './googlejs'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get googleTagManagerScripts() {
    return this.getOrSet('googleTagManagerScripts', GoogleTagManagerScripts)
  }
}
