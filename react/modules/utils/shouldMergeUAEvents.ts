export default function shouldMergeUAEvents() {
  return Boolean(window?.__gtm__?.mergeUAEvents)
}
