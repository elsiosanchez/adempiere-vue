// ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
// Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
// Contributor(s): Elsio Sanchez esanchez@erpya.com www.erpya.com
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Order Getters
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
  getPos: (state, getters) => {
    const OrderPos = {
      currentOrder: state.order,
      listOrder: getters.getListOrder,
      lineOrder: getters.getListOrderLine,
      listPayments: getters.getListPayments,
      isProcessed: getters.getIsProcessed
    }
    return OrderPos
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
  getFindOrder: (state) => {
    return state.findOrder
  }
}
