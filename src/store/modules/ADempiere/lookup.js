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
        // getLookup({
        //   tableName: 'C_PaymentTerm',
        //   parsedDirectQuery: "SELECT C_PaymentTerm.C_PaymentTerm_ID,NULL,NVL(C_PaymentTerm_Trl.Name,'-1'),C_PaymentTerm.IsActive FROM C_PaymentTerm INNER JOIN C_PaymentTerm_TRL ON (C_PaymentTerm.C_PaymentTerm_ID=C_PaymentTerm_Trl.C_PaymentTerm_ID AND C_PaymentTerm_Trl.AD_Language='es_MX') WHERE C_PaymentTerm.C_PaymentTerm_ID=?"
        // }, 106)
        getLookup(objectParams, objectParams.value)
          .then(response => {
            const map = response.getValuesMap()
            var options = {
              label: convertValueFromGRPC(map.get('DisplayColumn')),
              key: convertValueFromGRPC(map.get('KeyColumn'))
            }
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
