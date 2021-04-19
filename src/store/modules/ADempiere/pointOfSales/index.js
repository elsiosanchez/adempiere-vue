import Vue from 'vue'
import router from '@/router'
import {
  requestListPointOfSales
} from '@/api/ADempiere/form/point-of-sales.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification.js'

const withoutResponse = {
  isLoaded: false,
  isReload: true,
  recordCount: 0,
  currentPOS: {},
  nextPageToken: undefined
}

const pointOfSales = {
  state: {
    showPOSOptions: false,
    showPOSKeyLayout: false,
    showPOSCollection: false,
    pointOfSales: {
      ...withoutResponse
    },
    listPointOfSales: {},
    currentPointOfSales: {}
  },
  mutations: {
    setPontOfSales(state, pos) {
      state.pointOfSales = pos
    },
    setCurrentPOS(state, pos) {
      Vue.set(state.pointOfSales, 'currentPOS', pos)
    },
    setShowPOSOptions(state, isShowedOptions) {
      state.showPOSOptions = isShowedOptions
    },
    setShowPOSKeyLayout(state, isShowedKeyLayout) {
      state.showPOSKeyLayout = isShowedKeyLayout
    },
    setShowPOSCollection(state, isShowedCollection) {
      state.showPOSCollection = isShowedCollection
    },
    listPointOfSales(state, listPointOfSales) {
      state.listPointOfSales = listPointOfSales
    },
    currentPointOfSales(state, currentPointOfSales) {
      state.currentPointOfSales = currentPointOfSales
    }
  },
  actions: {
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
  },
  getters: {
    getIsShowPOSOptions: (state) => {
      return state.showPOSOptions
    },
    getShowPOSKeyLayout: (state) => {
      return state.showPOSKeyLayout
    },
    getShowCollectionPos: (state) => {
      return state.showPOSCollection
    },
    posAttributes: (state) => {
      return {
        listPointOfSales: state.listPointOfSales,
        currentPointOfSales: state.currentPointOfSales
      }
    }
  }
}

export default pointOfSales
