declare module 'render' {
  import * as React from 'react'
  import { Helmet } from 'react-helmet'

  interface RuntimeContext {
    workspace: string
    account: string
  }

  declare function withRuntimeContext(c: React.ComponentType<{} & RuntimeContext>): React.ComponentType<{}>

  export {Helmet, withRuntimeContext}
}
