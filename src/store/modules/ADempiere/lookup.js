import { getLookup, getLookupList } from '@/api/ADempiere'
import { convertValue, getCurrentRole } from '@/utils/ADempiere'

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
            const option = {
              label: convertValue(map.get('DisplayColumn')),
              key: convertValue(map.get('KeyColumn'))
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
    getLookupList: ({ commit, getters, rootGetters }, objectParams) => {
      return new Promise((resolve, reject) => {
        getLookupList(objectParams)
          .then(response => {
            const recordList = response.getRecordsList()
            var options = []
            recordList.forEach(element => {
              const map = element.getValuesMap()
              const name = convertValue(map.get('DisplayColumn'))
              const key = convertValue(map.get('KeyColumn'))
              options.push({
                label: name,
                key: key
              })
            })

            const clientId = rootGetters.getContext({
              columnName: '#AD_Client_ID'
            })

            commit('addLoockupList', {
              list: options,
              tableName: objectParams.tableName,
              parsedQuery: objectParams.query,
              roleUuid: getCurrentRole(),
              clientId: clientId
            })
            resolve(options)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    deleteLookupList({ commit, state }, params) {
      const lookupItem = state.lookupItem.filter(itemLookup => {
        return itemLookup.parsedDirectQuery !== params.parsedDirectQuery &&
        itemLookup.tableName !== params.tableName &&
        itemLookup.roleUuid !== getCurrentRole() &&
        itemLookup.value !== params.value
      })
      const lookupList = state.lookupList.filter(itemLookup => {
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
    getLookupItem: (state, getters, rootState, rootGetters) => (params) => {
      const clientId = rootGetters.getContext({
        columnName: '#AD_Client_ID'
      })
      return state.lookupItem.find(itemLookup => {
        return itemLookup.parsedDirectQuery === params.parsedDirectQuery &&
          itemLookup.tableName === params.tableName &&
          itemLookup.roleUuid === getCurrentRole() &&
          itemLookup.clientId === clientId &&
          itemLookup.value === params.value
      })
    },
    getLookupList: (state, getters, rootState, rootGetters) => (params) => {
      const clientId = rootGetters.getContext({
        columnName: '#AD_Client_ID'
      })
      const lookup = state.lookupList.find(itemLookup => {
        return itemLookup.parsedQuery === params.parsedQuery &&
          itemLookup.tableName === params.tableName &&
          itemLookup.roleUuid === getCurrentRole() &&
          itemLookup.clientId === clientId
      })
      if (lookup === undefined) {
        return []
      }
      return lookup.list
    }
  }
}

export default lookup
