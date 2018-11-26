# How to add to your Store

Open the VTEX APP Store and install the app on your store.

Next, open the app settings on your admin and paste the following code:

```js
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','YOUR_GTM_ID_HERE')
```

Remember to replace to your own GTM id, where the `YOUR_GTM_ID_HERE` is.

## Google Tag Manager Setup

To capture and analyze your store data on `GTM/Analytics`, you must create a tag associated with a trigger and the name of the event expected to be listenned, finally publish them to the master workspace. Also, you have to go to the store administration and add the GTM ID on the `Apps` page. After the GTM configuration, you can access the `Google Analytics` and observe the event appearing on the dashboard.
