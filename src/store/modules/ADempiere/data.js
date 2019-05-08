import { getObject, getObjectListFromCriteria } from '@/api/ADempiere/data'
import { convertValueFromGRPC } from '@/utils/ADempiere'

const data = {
  state: {
  },
  mutations: {
  },
  actions: {
    getObjectListFromCriteria: ({ dispatch }, objectParams) => {
      return new Promise((resolve, reject) => {
        getObjectListFromCriteria(objectParams.table, objectParams.criteria)
          .then(response => {
            const recordList = response.getRecordsList()
            var options = []
            recordList.forEach(element => {
              const map = element.getValuesMap()
              const value = convertValueFromGRPC(map.get('Value'))
              const name = convertValueFromGRPC(map.get('Name'))

              options.push({
                label: name,
                key: value
              })
            })
            resolve(options)
          })
          .catch(err => {
            console.warn('Data Criteria State - Error ' + err.code + ': ' + err.message)
            reject(err)
          })
      })
    },
    getObject: ({ dispatch }, objectParams) => {
      return new Promise((resolve, reject) => {
        getObject(objectParams.table, objectParams.recordUuid)
          .then(response => {
            var map = response.getValuesMap()
            var newValue = {}

            for (const [key, value] of map.entries()) {
              var valueResult = map.get(key)
              var tempValue = null
              if (valueResult) {
                tempValue = convertValueFromGRPC(value)
              }
              newValue[key] = tempValue

              dispatch('setContext', {
                parentUuid: objectParams.parentUuid,
                containerUuid: objectParams.containerUuid,
                columnName: key,
                value: tempValue
              })
            }
            resolve(newValue)
          })
          .catch(err => {
            console.warn('Data State - Error ' + err.code + ': ' + err.message)
            reject(err)
          })
      })
    }
  }
}

export default data
