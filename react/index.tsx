import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withRuntimeContext, Helmet } from 'render'
import { Pixel } from 'vtex.store/PixelContext'

import { gtmScript, gtmFrame } from './scripts/gtm'

const APP_LOCATOR = 'vtex.google-tag-manager'

interface Props {
  subscribe: (s: any) => () => void
  runtime: {
    workspace: string
    account: string
  }
}

/**
 * Component that encapsulate the communication to
 * the GoogleTagManager and listen for events comming
 * from the store through the Pixel HOC.
 * It injects the gtm script to the HTML Head.
 */
class GoogleTagManager extends Component<Props> {
  public static contextTypes = {
    /** Function to bind the APP Settings. */
    getSettings: PropTypes.func,
  }

  private unsubscribe: () => void

  constructor(props: Props) {
    super(props)
    this.unsubscribe = this.props.subscribe(this)
  }

  public gtm(data: any) {
    window.dataLayer.push(data)
  }

  get gtmId() {
    const { gtmId } = this.context.getSettings(APP_LOCATOR) || { gtmId: undefined }
    return gtmId
  }

  public productView = (event: any) => {
    const { products } = event
    let skuId = null
    if (products && products.length > 0) {
      skuId = products[0].id
    }
    this.gtm({
      event: 'productView',
      send_to: this.gtmId,
      sku_id: skuId
    })
  }

  public componentDidMount() {
    if (!this.gtmId) {
      const { runtime: { workspace, account } } = this.props

      console.warn(
        `No Google Tag Manager ID is defined. Take a look at:\
  https://${workspace}--${account}.myvtex.com/admin/apps/${APP_LOCATOR}/setup`
      )
    }

    this.gtm({js: new Date()})
    this.gtm({config: this.gtmId})
  }

  public shouldComponentUpdate() {
    // should only be rendered once
    return false
  }

  public render() {
    window.dataLayer = window.dataLayer || []

    const scripts = this.gtmId ? [{
      'type': 'application/javascript',
      'innerHTML': gtmScript(this.gtmId),
    }] : []

    const noscripts = this.gtmId ? [{
      id: 'gtm_frame',
      innerHTML: gtmFrame(this.gtmId)
    }] : []

    return (
      <Helmet script={scripts} noscript={noscripts} />
    )
  }
}

export default withRuntimeContext(Pixel(GoogleTagManager))
