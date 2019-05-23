import { getBrowserSearch } from '@/api/ADempiere/data'

const browserControl = {
  state: {
    browser: []
  },
  mutations: {
  },
  actions: {
    // process.uuid
    // process.parameters [
    //   {
    //     columnName,
    //     value
    //   }
    // ]
    getBrowserSearch({ commit, rootGetters }, browserUuid) {
      var parameters = rootGetters.getPanelParameters(browserUuid, true)

      return new Promise((resolve, reject) => {
        if (parameters.length > 0) {
          getBrowserSearch({
            uuid: browserUuid,
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
