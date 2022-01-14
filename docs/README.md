📢 Use this project, [contribute](https://github.com/vtex-apps/google-tag-manager) to it or open issues to help evolve it using [Store Discussion](https://github.com/vtex-apps/store-discussion).

# Google Tag Manager

The Google Tag Manager (GTM) app is a first-party integration to the [Google Tag Manager solution](https://tagmanager.google.com), a **JavaScript and HTML tag management system** provided by Google for tracking user browsing.

With the app, you can avoid contact with the store's source code when adding, editing, or removing website tags and quickly provide user browsing tracking for Google Analytics.

![gtm-overview](https://user-images.githubusercontent.com/67270558/149195530-858aebb6-7ebf-44ee-bd1b-63841521e0b7.png)

## Before you start 

You need a Google account to use Google Tag Manager. If you already use Google products, such as Gmail, you can use the same account.

If you don't have an account for a Google product, create one at [Creating your Google account](https://accounts.google.com/signup/v2/webcreateaccount?service=analytics&continue=https%3A%2F%2Ftagmanager.google.com%2F&dsh=S1158101756%3A1642078409369040&biz=true&flowName=GlifWebSignIn&flowEntry=SignUp&nogm=true). 

## Installing Google Tag Manager app

1. Access your VTEX **Admin** and go to **Account settings > Apps > App Store**
2. Search for the Google Tag Manager app.
3. You'll see a warning message about needing to enter the necessary configurations. Scroll down and type your GTM ID in the Google Tag Manager field.
4. Click on Save.

> ℹ Info
>
> To find your account GTM ID, access [the Google Tag Manager page](https://tagmanager.google.com) and log in to your account. The `Container ID` column provides the number you should use.

Once you have installed the app, you have to set it up with the variables, triggers, and tags necessary, to measure your store's data, allowing you to properly manage user and website traffic in your Google Analytics dashboard. Refer to [Setting up Google Tag Manager documentation](https://developers.vtex.com/vtex-developer-docs/docs/vtex-io-documentation-setting-up-google-tag-manager)  to create all necessary GTM components for your store.

## Restrictions
The VTEX IO Google Tag Manager solution uses the native GTM blocklist feature to avoid performance problems and unpredictable behavior. You can read more about this feature on the [Google Developer Guide](https://developers.google.com/tag-platform/tag-manager/web/restrict).

The HTML ID is blocked by default, which automatically blocklists all the tags, variables, and triggers of the type `customScripts`. The main consequence of this blocklist is that Custom HTML tags will not be triggered.

**The HTML blocklist is a VTEX Google Tag Manager app's default.** If you want to disable this restriction go to `https://{accountName}.myvtex.com/admin/apps/vtex.google-tag-manager@3.x/setup` and check the toggle below.

> ⚠️ 
>
> Remember to replace the value between the curly brackets with your store's account name.

![restrictions](https://user-images.githubusercontent.com/67270558/149350479-42dd3fbd-c727-4181-9c84-b76da0873d2f.png)

Most of the widely used Custom HTML tags are integrations with third-party services, like Customer Chat, Analytics, Remarketing, and Pixel tags. If your store needs a Custom HTML for one of those cases, the integration can be done by transforming the tags into a  [VTEX IO Pixel App](https://developers.vtex.com/vtex-developer-docs/docs/pixel-apps)  or by removing this restriction.

Check out below the full list of tags and variables that are blocked, by default, in VTEX IO Google Tag Manager solution below:

**Blocked tags**

- Custom HTML Tag - `html`
- Eulerian Analytics Tag - `ela`
- SaleCycle JavaScript Tag - `scjs`
- Upsellit Global Footer Tag - `uslt`
- Upsellit Confirmation Tag - `uspt`

**Blocked variables**
- Custom JavaScript Variable - `jsm`

Check out a list with all the GTM available tags on [the Google Developer Guide](https://developers.google.com/tag-platform/tag-manager/web/datalayer).

## Next step
- [Setting up Google Tag Manager documentation](https://developers.vtex.com/vtex-developer-docs/docs/vtex-io-documentation-setting-up-google-tag-manager) 
