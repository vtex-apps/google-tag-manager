# How to add to your Store

1 - Open the VTEX APP Store and install the app on your store.

2 - Add the following line to your store manifest:
>    
    "vtex.google-tag-manager": "0.x"

3 - Add the following code to your store pages.json:
>
    ...
    "templates": {
      "store": {
        ...
        "props": {
          "elements": [
            ...
            "pixel",
            ...
          ]
        },
        "extensions": {
          "pixel": {
            "component": "vtex.render-runtime/ExtensionContainer"
          },
          "pixel/google-tag-manager": {
            "component": "vtex.google-tag-manager/index"
          },
          ...
        }
      }
    }

## Google Tag Manager Setup

To capture and analyze your store data on `GTM/Analytics`, you must create a tag associated with a trigger with the name of the event expected to listen, and publish them to the master workspace. Also, you have to go to the store administration and add the GTM ID on the `Apps` page. After the GTM configuration, you can access the `Google Analytics` and observe the event appearing on the dashboard.

See an example in [Dreamstore](https://github.com/vtex-apps/dreamstore/blob/master/pages/pages.json).
