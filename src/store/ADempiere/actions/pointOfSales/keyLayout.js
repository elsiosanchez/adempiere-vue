import {
  getKeyLayout
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
  getKeyLayoutFromServer({ commit, getters }, keyLayoutUuid) {
    if (isEmptyValue(keyLayoutUuid)) {
      keyLayoutUuid = getters.getKeyLayoutUuidWithPOS
    }

    if (isEmptyValue(keyLayoutUuid)) {
      console.info('not load key layout')
      return
    }
    getKeyLayout({
      keyLayoutUuid
    })
      .then(responseKeyLayout => {
        commit('setKeyLayout', {
          ...responseKeyLayout,
          isLoaded: true,
          isReload: false
          // token,
          // pageNumber
        })
      })
      .catch(error => {
        console.warn(`getKeyLayoutFromServer: ${error.message}. Code: ${error.code}.`)
        showMessage({
          type: 'error',
          message: error.message,
          showClose: true
        })
      })
  }
}
