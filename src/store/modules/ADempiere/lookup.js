import { getLookup, getLookupList } from '@/api/ADempiere'
import { convertValueFromGRPC, getCurrentRole } from '@/utils/ADempiere'

const lookup = {
  state: {
    lookupItem: [],
    lookupList: []
  },
  mutations: {
    addLoockupItem(state, payload) {
      state.lookupItem.push(payload)
    },
    addLoockupList(state, payload) {
      state.lookupList.push(payload)
    },
    deleteLookupList(state, payload) {
      state.lookupItem = payload.lookupItem
      state.lookupList = payload.lookupList
    }
  },
  actions: {
    getLookup: ({ commit }, objectParams) => {
      return new Promise((resolve, reject) => {
        getLookup(objectParams, objectParams.value)
          .then(response => {
            const map = response.getValuesMap()
            var option = {
              label: convertValueFromGRPC(map.get('DisplayColumn')),
              key: convertValueFromGRPC(map.get('KeyColumn'))
            }
            commit('addLoockupItem', {
              option: option,
              value: objectParams.value,
              parsedDirectQuery: objectParams.directQuery,
              tableName: objectParams.tableName,
              roleUuid: getCurrentRole()
            })
            resolve(option)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /**
     * tableName,
     * query
     */
    getLookupList: ({ commit }, objectParams) => {
      return new Promise((resolve, reject) => {
        getLookupList(objectParams)
          .then(response => {
            const recordList = response.getRecordsList()
            var options = []
            recordList.forEach(element => {
              const map = element.getValuesMap()
              const name = convertValueFromGRPC(map.get('DisplayColumn'))
              const key = convertValueFromGRPC(map.get('KeyColumn'))
              options.push({
                label: name,
                key: key
              })
            })
            commit('addLoockupList', {
              list: options,
              tableName: objectParams.tableName,
              parsedQuery: objectParams.query,
              roleUuid: getCurrentRole()
            })
            resolve(options)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    deleteLookupList({ commit, state }, params) {
      var lookupItem = state.lookupItem.filter(itemLookup => {
        return itemLookup.parsedDirectQuery !== params.parsedDirectQuery &&
        itemLookup.tableName !== params.tableName &&
        itemLookup.roleUuid !== getCurrentRole() &&
        itemLookup.value !== params.value
      })
      var lookupList = state.lookupList.filter(itemLookup => {
        return itemLookup.parsedQuery !== params.parsedQuery &&
        itemLookup.tableName !== params.tableName &&
        itemLookup.roleUuid !== getCurrentRole()
      })
      commit('deleteLookupList', {
        lookupItem: lookupItem,
        lookupList: lookupList
      })
    }
  },
  getters: {
    getLookupItem: (state) => (params) => {
      return state.lookupItem.find(itemLookup => {
        return itemLookup.parsedDirectQuery === params.parsedDirectQuery &&
          itemLookup.tableName === params.tableName &&
          itemLookup.roleUuid === getCurrentRole() &&
          itemLookup.value === params.value
      })
    },
    getLookupList: (state) => (params) => {
      var lookup = state.lookupList.find(itemLookup => {
        return itemLookup.parsedQuery === params.parsedQuery &&
          itemLookup.tableName === params.tableName &&
          itemLookup.roleUuid === getCurrentRole()
      })
      if (lookup === undefined) {
        return []
      }
      return lookup.list
    }
  }
}

export default lookup
