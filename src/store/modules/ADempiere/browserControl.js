import { getBrowserSearch } from '@/api/ADempiere/data'

const browserControl = {
  state: {
    browser: []
  },
  mutations: {
  },
  actions: {
    // Call it like
    // browser.uuid
    // browser.query
    // browser.whereClause
    // browser.orderByClause
    // browser.parameters [
    //   {
    //     columnName,
    //     value
    //   }
    // ]
    getBrowserSearch({ commit, rootGetters }, browserUuid) {
      var browser = rootGetters.getBrowser(browserUuid)
      var parameters = rootGetters.getPanelParameters(browserUuid, true)
      return new Promise((resolve, reject) => {
        if (parameters.length > 0) {
          getBrowserSearch({
            uuid: browserUuid,
            query: browser.parsedQuery,
            whereClause: browser.parsedWhereClause,
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
