import { getBrowserSearch } from '@/api/ADempiere/data'
import { parseContext } from '@/utils/ADempiere'

const browserControl = {
  state: {
    browserSearch: []
  },
  mutations: {
    addBrowserSearch(state, payload) {
      state.browserSearch.push(payload)
    }
  },
  actions: {
    getBrowserSearch({ commit, rootGetters }, browserUuid) {
      var fieldList = rootGetters.getPanelParameters(browserUuid, true)
      // console.log(fieldList)
      if (fieldList.length > 0) {
        var parameters = fieldList.map(fieldItem => {
          return {
            columnName: fieldItem.columnName,
            value: fieldItem.value
          }
        })

        var browser = rootGetters.getBrowser(browserUuid)
        var parsedQuery = parseContext({
          parentUuid: browserUuid,
          containerUuid: browserUuid,
          value: browser.query
        })
        var parsedWhereClause = parseContext({
          parentUuid: browserUuid,
          containerUuid: browserUuid,
          value: browser.whereClause
        })

        var browserSearchQueryParameters = {
          uuid: browserUuid,
          query: parsedQuery,
          whereClause: parsedWhereClause,
          orderByClause: browser.orderByClause,
          parameters: parameters
        }
        console.log(browserSearchQueryParameters)
        // Add validation compare browserSearchQueryParameters
        // return new Promise((resolve, reject) => {
        getBrowserSearch(browserSearchQueryParameters)
          .then(response => {
            commit('addBrowserSearch', browserSearchQueryParameters)
            console.log(response)
            // resolve(response)
          })
          .catch(err => {
            console.warn(err)
            // reject(err)
          })
        // })
      }
    }
  },
  getters: {
  }
}

export default browserControl
