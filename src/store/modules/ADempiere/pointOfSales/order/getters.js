/**
 * Order Getters
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
  getOrder: (state) => {
    return state.order
  },
  getIsProcessed: (state) => {
    const order = state.order
    if (!isEmptyValue(order.documentStatus.value) &&
     (order.documentStatus.value === 'CO' || order.documentStatus.value === 'VO' || order.documentStatus.value === 'IP' || order.documentStatus.value === 'IP')) {
      return true
    }
    return false
  },
  getListOrder: (state) => {
    if (isEmptyValue(state.listOrder)) {
      return {
        ...withoutResponse,
        ordersList: []
      }
    }
    return state.listOrder
  },
  getCurrentOrder: (state) => {
    return state.currentOrder
  },
  getFindOrder: (state) => {
    return state.findOrder
  }
}
