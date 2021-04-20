/**
 * Product Price State
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
const withoutResponse = {
  isLoaded: false,
  isReload: true,
  recordCount: 0,
  nextPageToken: undefined
}
export default {
  productPrice: {
    ...withoutResponse,
    isShowPopoverField: false, // with field
    isShowPopoverMenu: false // with menu
  },
  searchProduct: ''
}
