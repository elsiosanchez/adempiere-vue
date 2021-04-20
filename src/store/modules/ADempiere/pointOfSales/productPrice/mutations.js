
/**
 * Product Price Mutations
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
import Vue from 'vue'

export default {
  setListProductPrice(state, productsPrices) {
    state.productPrice = {
      ...state.productPrice,
      ...productsPrices
    }
  },
  setProductPicePageNumber(state, pageNumber) {
    state.productPrice.pageNumber = pageNumber
  },
  showListProductPrice(state, payload) {
    Vue.set(state.productPrice, payload.attribute, payload.isShowed)
  },
  setIsReloadProductPrice(state) {
    Vue.set(state.productPrice, 'isReload', true)
    Vue.set(state.productPrice, 'isLoaded', false)
  },
  updtaeSearchProduct(state, searchProduct) {
    state.searchProduct = searchProduct
  }
}
