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
              // commit('addBrowserSearch', browserSearchQueryParameters)
              var recordList = response.getRecordsList().map((recordItem) => {
                var values = []
                recordItem.getValuesMap().forEach((value, key) => {
                  values.push({ key: key, value: convertValueFromGRPC(value) })
                })

                return {
                  id: recordItem.getId(),
                  uuid: recordItem.getUuid(),
                  tableName: recordItem.getTablename(),
                  valuesMap: values
                }
              })
              commit('addBrowserSearch', recordList)
              resolve(recordList)
            })
            .catch(err => {
              console.warn(err)
              reject(err)
            })
        } else {
          reject({ error: 0, message: 'No parameters' })
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
