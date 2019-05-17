import { getLookupList } from '@/api/ADempiere/data'
import { convertValueFromGRPC } from '@/utils/ADempiere'

const lookup = {
  state: {
    lookup: []
  },
  mutations: {
    addLoockupList(state, payload) {
      state.lookup.push(payload)
    }
  },
  actions: {
    getLookupList: ({ commit }, objectParams) => {
      // console.log(objectParams)
      return new Promise((resolve, reject) => {
        getLookupList(objectParams)
          .then(response => {
            const recordList = response.getRecordsList()
            var options = []
            var i = 0
            recordList.forEach(element => {
              const map = element.getValuesMap()
              const name = convertValueFromGRPC(map.get('DisplayColumn'))
              const value = i++
              options.push({
                label: name,
                key: value
              })
            })
            commit('addLoockupList', options)
            resolve(options)
          })
          .catch(err => {
            reject(err)
          })
      })
    }
  },
  getters: {}
}

export default lookup
