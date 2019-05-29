import { getBrowserSearch } from '@/api/ADempiere/data'
import { convertValueFromGRPC, parseContext } from '@/utils/ADempiere'

const browserControl = {
  state: {
    browserSearch: []
  },
  mutations: {
    addBrowserSearch(state, payload) {
      state.browserSearch = payload
    }
  },
  actions: {
    getBrowserSearch({ commit, rootGetters }, browserUuid) {
      return new Promise((resolve, reject) => {
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
          getBrowserSearch(browserSearchQueryParameters)
            .then(response => {
              const recordList = response.getRecordsList()
              var record = recordList.map(itemRecord => {
                const map = itemRecord.getValuesMap()
                var values = {}
                map.forEach((value, key) => {
                  values[key] = convertValueFromGRPC(value)
                })
                return values
              })
              console.log(record)
              commit('addBrowserSearch', record)
              resolve(record)
            })
            .catch(err => {
              console.warn(err)
              reject(err)
            })
        }
      })
    }
  },
  getters: {
    getResponseBrowser: (state) => () => {
      return state.browserSearch
    }
  }
}

export default browserControl
