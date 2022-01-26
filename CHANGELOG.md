# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added 
-`dimension4` property to the product data layer on `productView` events, representing the availability of the product

## [3.1.3] - 2021-12-28
### Fixed
- Product names on orderPlaced events now no longer include SKU name at the end

## [3.1.2] - 2021-11-19
### Fixed
- First event push is now detected correctly, considering that there may be GTM native events on the `dataLayer` array before the first push happens
- Current campaign is no longer invalidated when the browser referrer matches the storage referrer

## [3.1.1] - 2021-11-16
### Added
- `originalReferrer` to the docs

## [3.1.0] - 2021-11-09
### Added
- `originalReferrer` variable to events

### Changed
- Added mechanism to avoid losing campaign attributon. `originalLocation` variable is now dynamic and consider Google's session expiration rules.

## [3.0.3] - 2021-10-29

### Fixed:
- The variable name `OriginalLocation` to `originalLocation`.

## [3.0.2] - 2021-10-11
### Added
- Step on how to add the variable OriginalLocation to your Google Tag Manager (GTM) container and configure your store’s Google Analytics tags, to persist campaign data throughout a user session and avoid providing inconsistent campaign data to Google Analytics.

## [3.0.1] - 2021-07-29
### Fixed
- Add originalLocation variable to dataLayer

## [3.0.0] - 2021-07-13
### Changed
- All events are now using the productId as the main product identifier
- Product name doesn't include the variation anymore
- `variant` property now contains the SKU Id

### Added
- SKU id field to all events that contains product ids
- `list` property to `productView` (`productDetail`) event
- `position` property to `productClick` event
- `dimension1` property pointing to Product Reference Id
- `dimension2` property pointing to SKU Reference Id
- `dimension3` property pointing to SKU Name (previous variant)

### Fixed
- `productClick` and `productDetail` now considers the selected item when getting the product price
- `productClick` now considers the default seller when getting the item's price

### Removed
- Old backwards compatible `pageLoaded` and `productImpression` events

## [2.9.2] - 2021-03-30
### Fixed
- Use sellerDefault to select the default seller.

## [2.9.1] - 2021-03-17
### Fixed
- Property `price` being sent as `integer` in `addToCart` event when using the block `add-to-cart-button`.

## [2.9.0] - 2021-01-18
### Added
- Legacy events to dataLayer:
  - `homeView`
  - `categoryView`
  - `departmentView`
  - `internalSiteSearchView`
  - `productView`
  - `otherView`

## [2.8.1] - 2021-01-12
### Fixed
- Docs regarding Custom HTML tags.

## [2.8.0] - 2020-12-28
### Added
- `allowCustomHtmlTags` option on `settingsSchema`.

## [2.7.1] - 2020-12-18
### Added
- Public metadata information following App Store standards
- Billing Options structure following App Store standards

## [2.7.0] - 2020-12-08
### Added
- `list` property to `productClick`.

## [2.6.0] - 2020-12-01
### Added
- Events `promoView` and `promotionClick`.

## [2.5.1] - 2020-09-15
### Changed
- Replace handler of `vtex:cart` event to `vtex:cartLoaded`.

## [2.5.0] - 2020-09-14

## [2.4.1] - 2020-06-17
### Fixed
- Updated README.md file

## [2.4.0] - 2020-04-07
### Added
- Enable configuration by binding.

## [2.3.0] - 2020-02-12
### Added
- Event `userData`.

## [2.2.1] - 2020-02-11
### Fixed
- Events typings.

## [2.2.0] - 2019-09-12
### Changed

- Get blacklist values from server.

## [2.1.1] - 2019-09-09
### Changed
- Change `productDetail` event to send `id` and `variant` of the visible SKU
- Change `productClick` event to send `id` of the visible SKU
- Change `productImpression` event to send `id` of the visible SKU

## [2.1.0] - 2019-08-30

## [2.0.8] - 2019-07-23
### Fixed
- `category` field in `orderPlaced`, `productClick`, `productImpression`, `addToCart, and `removeFromCart`.

## [2.0.7] - 2019-07-23
### Added
- Event `productClick`.

## [2.0.6] - 2019-07-09

## [2.0.5] - 2019-06-27

### Fixed

- Build assets with new builder hub.

## [2.0.4] - 2019-05-27

### Fixed

- Use ES5.
- Avoid using global scope.

## [2.0.3] - 2019-05-27

## [2.0.2] - 2019-05-25

## [2.0.1] - 2019-05-25

## [2.0.0] - 2019-05-25
### Changed
- Ported to pixel builder 0

## [1.5.1] - 2019-05-23

### Fixed

- Typo in `orderPlaced` Enhanced Ecommerce property.

## [1.5.0] - 2019-05-22

### Added

- Event `productImpression`.

### Changed

- Add Enhanced Ecommerce data to `orderPlaced` event.

## [1.4.0] - 2019-05-22

### Added

- Event `pageView`.
- Property `event: 'productDetail'` to product view event.

## [1.3.0] - 2019-05-09

### Fixed

- Use the right price property.

### Added

- Event `removeFromCart`.
- Event `orderPlaced`.

## [1.2.0] - 2019-03-18

### Added

- Add `pixel` policy.

## [1.1.0] - 2019-01-25

## [1.0.0] - 2019-01-16

### Changed

- Migrate the app to typescript.
- Update to use new pixel API.

## [0.1.2] - 2018-12-04

### Fixed

- Add billingOptions on manifest.json.

## [0.1.1] - 2018-12-03

### Added

- Add full description to publish in Apps Store.

### Changed

- Change the Readme to reflect the Setup of the service.

## [0.1.0] - 2018-09-26

### Added

- MVP of `Google Tag Manager`.
