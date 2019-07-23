import { getLookup, getLookupList } from '@/api/ADempiere/data'
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
        // getLookup({
        //   tableName: 'C_PaymentTerm',
        //   parsedDirectQuery: "SELECT C_PaymentTerm.C_PaymentTerm_ID,NULL,NVL(C_PaymentTerm_Trl.Name,'-1'),C_PaymentTerm.IsActive FROM C_PaymentTerm INNER JOIN C_PaymentTerm_TRL ON (C_PaymentTerm.C_PaymentTerm_ID=C_PaymentTerm_Trl.C_PaymentTerm_ID AND C_PaymentTerm_Trl.AD_Language='es_MX') WHERE C_PaymentTerm.C_PaymentTerm_ID=?"
        // }, 106)
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
              parsedDirectQuery: objectParams.parsedDirectQuery,
              tableName: objectParams.tableName,
              roleUuid: getCurrentRole()
            })
            resolve(option)
          })
          .catch(err => {
            reject(err)
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
          .catch(err => {
            reject(err)
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
