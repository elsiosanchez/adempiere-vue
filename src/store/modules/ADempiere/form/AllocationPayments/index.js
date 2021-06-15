const AllocationPayments = {
  invoiceList: [],
  paymentList: []
}

export default {
  state: AllocationPayments,
  mutations: {
    setInvoiceLis(state, list) {
      state.invoiceList = list
    },
    setPaymentList(state, list) {
      state.paymentList = list
    }
  },
  actions: {
    serverPaymentList({ commit }, params) {
      commit('setPaymentList', params)
    },
    serverBillingList({ commit }, params) {
      commit('setInvoiceLis', params)
    }
  },
  getters: {
    getInvoiceList: (state) => {
      return state.invoiceList
    },
    getPaymentList: (state) => {
      return state.paymentList
    }
  }
}
