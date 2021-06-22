import {
  paymentList,
  invocesList,
  summaryList
} from '@/api/ADempiere/form/v-allocation.js'
import { showMessage } from '@/utils/ADempiere/notification.js'

const AllocationPayments = {
  invoiceList: [],
  paymentList: [],
  summaryList: []
}

export default {
  state: AllocationPayments,
  mutations: {
    setInvoiceLis(state, list) {
      state.invoiceList = list
    },
    setPaymentList(state, list) {
      state.paymentList = list
    },
    setSummaryList(state, list) {
      state.summaryList = list
    }
  },
  actions: {
    serverPaymentList({ commit }, businessPartnerUuid) {
      paymentList({
        businessPartnerUuid
      })
        .then(responsePaymentList => {
          commit('setPaymentList', responsePaymentList)
        })
        .catch(error => {
          console.warn(`serverPaymentList: ${error.message}. Code: ${error.code}.`)
          showMessage({
            type: 'error',
            message: error.message,
            showClose: true
          })
        })
    },
    serverBillingList({ commit }, businessPartnerUuid) {
      invocesList({
        businessPartnerUuid
      })
        .then(response => {
          commit('setInvoiceLis', response)
        })
        .catch(error => {
          console.warn(`serverBillingList: ${error.message}. Code: ${error.code}.`)
          showMessage({
            type: 'error',
            message: error.message,
            showClose: true
          })
        })
    },
    searchServerPaymentAllocationSummaryList({ commit }, businessPartnerUuid) {
      summaryList({
        businessPartnerUuid
      })
        .then(response => {
          commit('setSummaryList', response)
        })
        .catch(error => {
          console.warn(`searchServerPaymentAllocationSummaryList: ${error.message}. Code: ${error.code}.`)
          showMessage({
            type: 'error',
            message: error.message,
            showClose: true
          })
        })
    }
  },
  getters: {
    getInvoiceList: (state) => {
      return state.invoiceList
    },
    getPaymentList: (state) => {
      return state.paymentList
    },
    getSummaryList: (state) => {
      return state.summaryList
    }
  }
}
