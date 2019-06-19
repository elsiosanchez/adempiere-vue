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
              parsedQuery: objectParams.query
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
    getLookupList: (state) => (params) => {
      var lookup = state.lookup.find(item => {
        return item.parsedQuery === params.parsedQuery && item.tableName === params.tableName
      })
      if (typeof lookup === 'undefined') {
        return []
      }
      return lookup.list
    }
  }
}

export default lookup
