import { getLookup, getLookupList } from '@/api/ADempiere/data'
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
    getLookup: ({ commit }, objectParams) => {
      return new Promise((resolve, reject) => {
        getLookup(objectParams, objectParams.value)
          .then(response => {
            var options = [{
              label: response.name,
              key: response.value
            }]
            commit('addLoockupList', options)
            resolve(options)
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getLookupList: ({ commit }, objectParams) => {
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
            commit('addLoockupList', {
              list: options,
              parsedQuery: objectParams.parsedQuery
            })
            resolve(options)
          })
          .catch(err => {
            reject(err)
          })
      })
    }
  },
  getters: {
    getLookupList: (state) => (parsedQuery) => {
      var lookup = state.lookup.find(
        item => item.parsedQuery === parsedQuery
      )
      if (typeof lookup === 'undefined') {
        return lookup
      }
      return lookup.list
    }
  }
}

export default lookup
