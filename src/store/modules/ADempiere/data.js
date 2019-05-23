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
        getObjectListFromCriteria('C_BPartner', "IsCustomer = 'Y'")
          .then(response => {
            var recordList = response.getRecordsList().map((recordItem) => {
              return {
                id: recordItem.getId(),
                uuid: recordItem.getUuid(),
                tableName: recordItem.getTablename(),
                valuesMap: recordItem.getValuesMap()
              }
            })
            /* var values = []
            recordList.forEach(element => {
              element.valuesMap.forEach((value, key) => {
                values.push({
                  key: key,
                  value: convertValueFromGRPC(value)
                })
                element.valuesMap = values
              })
            }) */
            console.log(recordList)
          })
          .catch(error => {
            console.log(error)
          })
      })
    }
    /* getObjectListFromCriteria: ({ dispatch }, objectParams) => {
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
            console.log(err)
            reject(err)
          })
      })
    } */
  }
}

export default data
