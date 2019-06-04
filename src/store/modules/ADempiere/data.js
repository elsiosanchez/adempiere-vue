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
    getObjectListFromCriteria: ({ commit, dispatch, rootGetters }, objectParams) => {
      return new Promise((resolve, reject) => {
        getObjectListFromCriteria(objectParams.table, objectParams.criteria)
          .then(response => {
            const recordList = response.getRecordsList()
            var record = recordList.map(itemRecord => {
              const map = itemRecord.getValuesMap()
              var values = {}
              map.forEach((value, key) => {
                values[key] = convertValueFromGRPC(value)
              })
              return values
            })

            var selection = rootGetters.getDataRecordSelection(objectParams.containerUuid)
            commit('recordSelection', {
              containerUuid: objectParams.containerUuid,
              record: record,
              selection: selection
            })
            resolve(record)
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
    /**
     * Getter converter selection data record in object format
     * {
     *    keyColumnRecord: {
     *      columname: value,
     *      columname: value,
     *      columname: value
     *    },
     *    keyColumnRecord: {
     *      columname: value,
     *      columname: value,
     *      columname: value
     *    }
     * }
     */
    getSelectionToServer: (state, getters, rootState, rootGetters) => (containerUuid) => {
      var selectionToServer = {}
      var data = getters.getDataRecordAndSelection(containerUuid)
      if (data.selection.length > 0) {
        var panel = rootGetters.getPanel(containerUuid)
        var keyColumn = panel.keyColumn
        data.selection.forEach(itemRow => {
          var recordKeyColumn = itemRow[keyColumn]

          Object.defineProperty(selectionToServer, recordKeyColumn, {
            value: itemRow,
            writable: true,
            configurable: true,
            enumerable: true
          })
          // selectionToServer[recordKeyColumn] = itemRow
        })
      }
      return selectionToServer
    }
  }
}

export default data
