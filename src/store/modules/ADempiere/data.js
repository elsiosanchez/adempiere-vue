import { getObject, getObjectListFromCriteria } from '@/api/ADempiere/data'
import { convertValueFromGRPC } from '@/utils/ADempiere'

const data = {
  state: {
  },
  mutations: {
  },
  actions: {
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
            reject(err)
          })
      })
    },
    getObjectListFromCriteria: ({ dispatch }, objectParams) => {
      return new Promise((resolve, reject) => {
        getObjectListFromCriteria(objectParams.table, objectParams.criteria)
          .then(response => {
            var recordList = response.getRecordsList().map((recordItem) => {
              var values = []
              recordItem.getValuesMap().forEach((value, key) => {
                values.push({ key: key, value: convertValueFromGRPC(value) })
              })
              return {
                id: recordItem.getId(),
                uuid: recordItem.getUuid(),
                tableName: recordItem.getTablename(),
                valuesMap: values
              }
            })
            resolve(recordList)
          })
          .catch(error => {
            console.log('Error getting data with criteria' + error)
            reject(error)
          })
      })
    }
  }
}

export default data
