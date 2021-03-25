import {
  requestListPointOfSales
} from '@/api/ADempiere/form/point-of-sales.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification.js'

/**
 * Point of Sales Actions
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
export default {
  /**
   * List point of sales terminal
   * @param {number} posToSet id to set
   */
  listPointOfSales({ commit, getters, dispatch }) {
    const userUuid = getters['user/getUserUuid']
    if (!isEmptyValue(userUuid)) {
      requestListPointOfSales({
        userUuid
      })
        .then(response => {
          commit('sellingPointsList', response.sellingPointsList)
        })
        .catch(error => {
          console.warn(`listPointOfSalesFromServer: ${error.message}. Code: ${error.code}.`)
          showMessage({
            type: 'error',
            message: error.message,
            showClose: true
          })
        })
    }
  }
}
