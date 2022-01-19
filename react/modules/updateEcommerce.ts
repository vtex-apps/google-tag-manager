import push from './push';

export default function updateEcommerce(eventName: string, data: Record<string, unknown>) {
   const eventIndex = window.dataLayer.findIndex(gtmEvent => gtmEvent.event === eventName);

   (eventIndex >= 0) && window.dataLayer.splice(eventIndex, 1);
   
   push(data);
}