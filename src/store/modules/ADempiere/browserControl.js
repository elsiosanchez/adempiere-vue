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
    getBrowserSearch({ commit, dispatch, rootGetters }, browserUuid) {
      return new Promise((resolve, reject) => {
        var fieldListRange = []
        var fieldList = rootGetters.getPanelParameters(browserUuid, true)
        if (fieldList.length > 0) {
          var parameters = fieldList.map(fieldItem => {
            if (fieldItem.isRange) {
              fieldListRange.push({ columnName: fieldItem.columnName + '_To', value: fieldItem.valueTo })
            }
            return {
              columnName: fieldItem.columnName,
              value: fieldItem.value
            }
          })
          var finalParameters = parameters.concat(fieldListRange)
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
            parameters: finalParameters
          }
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

              var selection = rootGetters.getDataSelection(browserUuid)
              commit('recordSelection', {
                containerUuid: browserUuid,
                record: record,
                selection: selection
              })
              resolve(record)
            })
            .catch(err => {
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
