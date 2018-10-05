import PropTypes from 'prop-types'
import { path } from 'ramda'
import React, { Component } from 'react'
import { Helmet, withRuntimeContext } from 'render'
import { Pixel } from 'vtex.store/PixelContext'

import { gtmFrame, gtmScript } from './scripts/gtm'

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

  public push(data: any) {
    window.dataLayer.push(data)
  }

  get gtmId() {
    const { gtmId } = this.context.getSettings(APP_LOCATOR) || { gtmId: undefined }
    return gtmId
  }

  public productView = (event: any) => {
    const {
      product: {
        productId,
        productName,
        brand,
        categories,
        items
      }
    } = event

    const category = path(['0'], categories) as string

    const data = {
      ecommerce: {
        detail: {
          products: [
            {
              brand,
              category: category && category.replace(/^\/|\/$/g, ''),
              id: productId,
              name: productName,
              price: path([])
            },
          ],
        },
      },
    }

    this.push(data)
  }

  public componentDidMount() {
    if (!this.gtmId) {
      const { runtime: { workspace, account } } = this.props

      console.warn(
        'No Google Tag Manager ID is defined. Take a look at' +
        `https://${workspace}--${account}.myvtex.com/admin/apps/${APP_LOCATOR}/setup`
      )
    }

    this.push({js: new Date()})
    this.push({config: this.gtmId})
  }

  public componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  public shouldComponentUpdate() {
    // should only be rendered once
    return false
  }

  public render() {
    window.dataLayer = window.dataLayer || []

    const scripts = this.gtmId ? [{
      innerHTML: gtmScript(this.gtmId),
      type: 'application/javascript',
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
