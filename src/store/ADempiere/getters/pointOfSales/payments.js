/**
 * Payments Getters
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */

export default {
  getPaymentBox: (state) => {
    return state
  },
  getMultiplyRate: (state) => {
    return state.multiplyRate
  },
  getDivideRate: (state) => {
    return state.divideRate
  },
  getMultiplyRateCollection: (state) => {
    return state.multiplyRateCollection
  },
  getDivideRateCollection: (state) => {
    return state.divideRateCollection
  },
  getListPayments: (state) => {
    return state.listPayments
  },
  getListsPaymentTypes: (state) => {
    return state.tenderTypeDisplaye
  },
  getListCurrency: (state) => {
    return state.currency
  },
  getConvertionPayment: (state) => {
    return state.convertion
  }
}
