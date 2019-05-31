import { getObject, getObjectListFromCriteria } from '@/api/ADempiere/data'
import { convertValueFromGRPC } from '@/utils/ADempiere'

const data = {
  state: {
    recordSelection: [],
    dataSelection: [],
    dataRecord: []
  },
  mutations: {
    recordSelection(state, payload) {
      if (payload.index > -1) {
        state.recordSelection.splice(payload.index, 1)
      }
      state.recordSelection.push(payload)
    }
  },
  actions: {
    recordSelection({ commit, state }, parameters) {
      var index = state.recordSelection.findIndex((recordItem) => {
        return recordItem.containerUuid === parameters.containerUuid
      })
      commit('recordSelection', {
        ...parameters,
        index: index
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
  },
  getters: {
    getDataRecordAndSelection: (state) => (containerUuid) => {
      var data = state.recordSelection.find(itemRecord => {
        return itemRecord.containerUuid === containerUuid
      })
      if (typeof data !== 'undefined') {
        return data
      }
      return {
        containerUuid: containerUuid,
        record: [],
        selection: []
      }
    },
    getDataRecordDetail: (state, getters) => (containerUuid) => {
      var data = getters.getDataRecordAndSelection(containerUuid)
      return data.record
    },
    getDataRecordSelection: (state, getters) => (containerUuid) => {
      var selection = getters.getDataRecordAndSelection(containerUuid)
      return selection.selection
    },
    getSelectionToServer: (state, getters, rootState, rootGetters) => (containerUuid) => {
      var selectionToServer = {}
      var data = getters.getDataRecordAndSelection(containerUuid)
      if (data.selection.length > 0) {
        var panel = rootGetters.getPanel(containerUuid)
        var keyColumn = panel.keyColumn
        data.selection.forEach(itemRow => {
          var recordKeyColumn = itemRow[keyColumn]
          selectionToServer[recordKeyColumn] = itemRow
        })
      }
      return selectionToServer
    }
  }
}

export default data
