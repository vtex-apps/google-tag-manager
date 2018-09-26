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

4 - Configure your GTM ID on the VTEX Admin, openning the APP's session at the left-side menu.

See an example in [Dreamstore](https://github.com/vtex-apps/dreamstore/blob/master/pages/pages.json).