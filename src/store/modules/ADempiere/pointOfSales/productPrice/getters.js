/**
 * Product Price Getters
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

const withoutResponse = {
  isLoaded: false,
  isReload: true,
  recordCount: 0,
  nextPageToken: undefined
}

export default {
  getProductPrice: (state) => {
    if (isEmptyValue(state.productPrice) || !state.productPrice.isLoaded) {
      return {
        ...withoutResponse,
        productPricesList: []
      }
    }
    return state.productPrice
  },
  getSearchProduct: (state) => {
    return state.searchProduct
  }
}
