export default function shouldSendGA4Events() {
  return Boolean(window?.__gtm__?.sendGA4Events)
}
