import router from '@/router'
import {
  requestListPointOfSales
} from '@/api/ADempiere/form/point-of-sales.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification.js'

/**
 * Pos Actions
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
export default {
  /**
   * List point of sales terminal
   * @param {number} posToSet id to set
   */
  listPointOfSalesFromServer({ commit, getters, dispatch }, posToSet = null) {
    const userUuid = getters['user/getUserUuid']
    let pos, listPos
    requestListPointOfSales({
      userUuid
    })
      .then(response => {
        listPos = response.sellingPointsList
        if (!isEmptyValue(posToSet)) {
          pos = listPos.find(itemPOS => itemPOS.id === parseInt(posToSet))
        }
        if (isEmptyValue(pos) && isEmptyValue(posToSet)) {
          pos = listPos.find(itemPOS => itemPOS.salesRepresentative.uuid === userUuid)
        }
        if (isEmptyValue(pos)) {
          pos = listPos[0]
        }
        commit('listPointOfSales', listPos)
        dispatch('setCurrentPOS', pos)
      })
      .catch(error => {
        console.warn(`listPointOfSalesFromServer: ${error.message}. Code: ${error.code}.`)
        showMessage({
          type: 'error',
          message: error.message,
          showClose: true
        })
      })
  },
  setCurrentPOS({ commit, dispatch }, posToSet) {
    commit('currentPointOfSales', posToSet)
    const currentPOS = posToSet
    const oldRoute = router.app._route
    router.push({
      name: oldRoute.name,
      params: {
        ...oldRoute.params
      },
      query: {
        ...oldRoute.query,
        pos: posToSet.id
      }
    }, () => {})

    commit('setIsReloadKeyLayout')
    commit('setIsReloadProductPrice')
    commit('setIsReloadListOrders')
    commit('setShowPOSKeyLayout', false)

    // Maintain Order and Product List
    dispatch('listOrdersFromServer', {
      posUuid: currentPOS.uuid
    })
    dispatch('listProductPriceFromServer', {
      currentPOS
    })
  }
}
