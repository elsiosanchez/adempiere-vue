import {
  getKeyLayout
} from '@/api/ADempiere/form/point-of-sales.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification.js'

/**
 * keyLayout Actions
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
export default {
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
