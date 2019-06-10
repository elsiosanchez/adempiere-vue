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
        // parameters isQueryCriteria
        var finalParameters = rootGetters.getParamsProcessToServer(browserUuid)
        if (finalParameters.params.length > 0) {
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
            parameters: finalParameters.params
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

              var selection = rootGetters.getDataRecordSelection(browserUuid)
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
