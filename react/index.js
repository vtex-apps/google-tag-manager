import { Component } from 'react'
import { Helmet } from 'render'
import { Pixel } from 'vtex.store/PixelContext'
import { gtmScript, gtmFrame } from './scripts/gtm'

const APP_LOCATOR = 'vtex.google-tag-manager'

/**
 * Component that encapsulate the communication to
 * the GoogleTagManager and listen for events comming
 * from the store through the Pixel HOC. 
 * It injects the gtm script to the HTML Head.
 */
class GoogleTagManager extends Component {
  constructor(props) {
    super(props)
    this.props.subscribe(this)
  }
  
  gtm(data) {
    window.dataLayer.push(data)
  }
  
  get gtmId() {
    const { gtmId } = this.context.getSettings(APP_LOCATOR) || {} 
    if (!gtmId) {
      console.warn("Warning: The GTM ID isn't set on your environment.")
    }
    return gtmId 
  }

  productView = event => {
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

  componentDidMount() {
    window.dataLayer = window.dataLayer || []
    this.gtm({js: new Date()})
    this.gtm({config: this.gtmId})
  }

  render() {
    const scripts = this.gtmId ? [{
      'type': 'application/javascript',
      'innerHTML': gtmScript(this.gtmId),
    }] : []
    const noscripts = this.gtmId ? [{ id: 'gtm_frame', innerHTML: gtmFrame(this.gtmId) }] : []

    return (
      <Helmet script={scripts} noscript={noscripts} />
    )
  }
}

GoogleTagManager.contextTypes = {
  /** Function to bind the APP Settings. */
  getSettings: PropTypes.func,
}

export default Pixel(GoogleTagManager)