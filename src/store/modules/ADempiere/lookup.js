import { getLookup, getLookupList } from '@/api/ADempiere'
import { convertValueFromGRPC, isEmptyValue, getCurrentRole, parseContext } from '@/utils/ADempiere'

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
    getLookupItemFromServer({ commit, rootGetters }, parameters) {
      const { parentUuid, containerUuid, value, tableName, directQuery } = parameters
      var parsedDirectQuery = directQuery
      if (parsedDirectQuery.includes('@')) {
        parsedDirectQuery = parseContext({
          parentUuid: parentUuid,
          containerUuid: containerUuid,
          value: directQuery
        })
      }

      return getLookup({
        tableName: tableName,
        directQuery: parsedDirectQuery,
        value: value
      })
        .then(response => {
          const map = response.getValuesMap()
          const label = convertValueFromGRPC(map.get('DisplayColumn'))
          var option = {
            label: isEmptyValue(label) ? ' ' : label,
            // key: convertValueFromGRPC(map.get('KeyColumn'))
            key: value
          }

          commit('addLoockupItem', {
            option: option,
            value: value, // isNaN(objectParams.value) ? objectParams.value : parseInt(objectParams.value, 10),
            parsedDirectQuery: directQuery,
            tableName: tableName,
            roleUuid: getCurrentRole(),
            clientId: rootGetters.getContextClientId
          })
          return option
        })
        .catch(error => {
          console.warn('Get Lookup, Select Base - Error ' + error.code + ': ' + error.message)
        })
    },
    /**
     * tableName,
     * query
     */
    getLookupListFromServer({ commit, rootGetters }, parameters) {
      const { parentUuid, containerUuid, tableName, query } = parameters
      var parsedQuery = query
      if (parsedQuery.includes('@')) {
        parsedQuery = parseContext({
          parentUuid: parentUuid,
          containerUuid: containerUuid,
          value: query
        })
      }

      return getLookupList({
        tableName: tableName,
        query: parsedQuery
      })
        .then(response => {
          const recordList = response.getRecordsList()
          var options = []
          recordList.forEach(element => {
            const map = element.getValuesMap()
            const name = convertValueFromGRPC(map.get('DisplayColumn'))
            const key = convertValueFromGRPC(map.get('KeyColumn'))
            options.push({
              label: isEmptyValue(name) ? ' ' : name,
              key: isEmptyValue(key) ? -1 : isNaN(key) ? key : parseInt(key)
            })
          })

          commit('addLoockupList', {
            list: options,
            tableName: tableName,
            parsedQuery: parsedQuery,
            roleUuid: getCurrentRole(),
            clientId: rootGetters.getContextClientId
          })
          return options
        })
        .catch(error => {
          console.warn('Get Lookup List, Select Base - Error ' + error.code + ': ' + error.message)
        })
    },
    deleteLookupList({ commit, state }, params) {
      const { parentUuid, containerUuid, tableName, query, directQuery, value } = params

      var parsedDirectQuery = directQuery
      if (parsedDirectQuery.includes('@')) {
        parsedDirectQuery = parseContext({
          parentUuid: parentUuid,
          containerUuid: containerUuid,
          value: parsedDirectQuery
        })
      }
      const lookupItem = state.lookupItem.filter(itemLookup => {
        return itemLookup.parsedDirectQuery !== params.parsedDirectQuery &&
        itemLookup.tableName !== tableName &&
        itemLookup.value !== value &&
        itemLookup.roleUuid !== getCurrentRole()
      })

      var parsedQuery = query
      if (parsedQuery.includes('@')) {
        parsedQuery = parseContext({
          parentUuid: parentUuid,
          containerUuid: containerUuid,
          value: parsedQuery
        })
      }
      const lookupList = state.lookupList.filter(itemLookup => {
        return itemLookup.parsedQuery !== parsedQuery &&
        itemLookup.tableName !== tableName &&
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
      var parsedDirectQuery = params.directQuery
      if (parsedDirectQuery.includes('@')) {
        parsedDirectQuery = parseContext({
          parentUuid: params.parentUuid,
          containerUuid: params.containerUuid,
          value: parsedDirectQuery
        })
      }
      const lookupItem = state.lookupItem.find(itemLookup => {
        return itemLookup.parsedDirectQuery === parsedDirectQuery &&
          itemLookup.tableName === params.tableName &&
          itemLookup.roleUuid === getCurrentRole() &&
          itemLookup.clientId === rootGetters.getContextClientId &&
          itemLookup.value === params.value
      })
      if (lookupItem) {
        return lookupItem.option
      }
      return undefined
    },
    getLookupList: (state, getters, rootState, rootGetters) => (params) => {
      var parsedQuery = params.query
      if (parsedQuery.includes('@')) {
        parsedQuery = parseContext({
          parentUuid: params.parentUuid,
          containerUuid: params.containerUuid,
          value: parsedQuery
        })
      }
      const lookupList = state.lookupList.find(itemLookup => {
        return itemLookup.parsedQuery === parsedQuery &&
          itemLookup.tableName === params.tableName &&
          itemLookup.roleUuid === getCurrentRole() &&
          itemLookup.clientId === rootGetters.getContextClientId
      })
      if (lookupList) {
        return lookupList.list
      }
      return []
    },
    /**
     *
     */
    getLookupAll: (state, getters, rootState, rootGetters) => (parameters) => {
      var list = getters.getLookupList(parameters)
      const item = getters.getLookupItem(parameters)
      if (item && !list.find(itemLookup => itemLookup.key === item.key)) {
        list.push(item)
      }
      return list
    }
  }
}

export default lookup
