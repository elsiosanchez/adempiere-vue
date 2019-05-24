import { getBrowserSearch } from '@/api/ADempiere/data'
import { parseContext } from '@/utils/ADempiere'

const browserControl = {
  state: {
    browser: []
  },
  mutations: {
  },
  actions: {
    getBrowserSearch({ commit, rootGetters }, browserUuid) {
      var parameters = rootGetters.getPanelParameters(browserUuid, true)
      return new Promise((resolve, reject) => {
        if (parameters.length > 0) {
          var browser = rootGetters.getBrowser(browserUuid)
          var parsedQuery = parseContext({
            parentUuid: browserUuid,
            containerUuid: browserUuid,
            value: browser.query
          })
          var parsedWhereClause = parseContext({
            parentUuid: browserUuid,
            containerUuid: browserUuid,
            value: browser.query
          })
          // var parsedOrderByClause = parseContext({
          //   parentUuid: browserUuid,
          //   containerUuid: browserUuid,
          //   value: browser.orderByClause
          // })

          getBrowserSearch({
            uuid: browserUuid,
            query: parsedQuery,
            whereClause: parsedWhereClause,
            orderByClause: browser.orderByClause,
            parameters: parameters
          })
            .then(response => {
              console.log(response)
              resolve(response)
            })
            .catch(err => {
              reject(err)
            })
        }
      })
    }
  },
  getters: {
  }
}

export default browserControl
