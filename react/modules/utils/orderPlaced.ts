export const checkHasOrderInMD = async () => {
   const url = new URL(window.location.href);
   const orderId = url.searchParams.get('og');

   if(orderId) {
      const masterDataURL = `/api/dataentities/OD/search?orderId=${orderId}&_fields=orderId&_v=${Date.now()}`;
      const response = await fetch(masterDataURL);
      const orderIdMD = await response.json();
   
      Array.isArray(orderIdMD) &&
      !orderIdMD.length && (
         await handlePostOrderInMD(orderId)
      );

      return Array.isArray(orderIdMD) ? !!orderIdMD.length : false;
   }

   return false;
};

const handlePostOrderInMD = async (orderId: string) => {
   const masterDataURL = '/api/dataentities/OD/documents';

   await fetch(masterDataURL, {
      method: 'POST',
      body: JSON.stringify({ orderId }),
      headers: {
         "Accept": "application/json, text/plain, */*",
         "Content-Type": "application/json",
      }
   });
};