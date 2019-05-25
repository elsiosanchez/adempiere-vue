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
      var parameters = rootGetters.getPanelParameters(browserUuid, true)
      console.log(parameters)
      if (parameters.length > 0) {
        parameters = parameters.map(fieldItem => {
          return {
            columnName: fieldItem.columnName,
            value: fieldItem.value
          }
        })
        console.log(parameters)
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

        var browserSearchQueryParams = {
          uuid: browserUuid,
          query: parsedQuery,
          whereClause: parsedWhereClause,
          orderByClause: browser.orderByClause,
          parameters: parameters
        }
        console.log(browserSearchQueryParams)
        // Add validation compare browserSearchQueryParams
        // return new Promise((resolve, reject) => {
        getBrowserSearch(browserSearchQueryParams)
          .then(response => {
            commit('addBrowserSearch', browserSearchQueryParams)
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
