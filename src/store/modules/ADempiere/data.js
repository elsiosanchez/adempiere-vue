import { getObject, getObjectListFromCriteria, getRecentItems } from '@/api/ADempiere'
import { convertValuesMapToObject, isEmptyValue } from '@/utils/ADempiere'

const data = {
  state: {
    recordSelection: [], // record data and selection
    recordDetail: [],
    recentItems: []
  },
  mutations: {
    recordSelection(state, payload) {
      if (payload.index > -1 && payload.index !== undefined) {
        state.recordSelection.splice(payload.index, 1, payload)
      } else {
        state.recordSelection.push(payload)
      }
    },
    deleteRecordContainer(state, payload) {
      state.recordSelection = payload
    },
    notifyCellTableChange: (state, payload) => {
      payload.row[payload.columnName] = payload.value
      if (payload.displayColumn !== undefined) {
        var key = 'DisplayColumn_' + payload.columnName
        payload.row[key] = payload.displayColumn
      }
    },
    notifyCellSelectionChange: (state, payload) => {
      if (payload.row !== undefined) {
        payload.row[payload.columnName] = payload.value
        if (payload.displayColumn !== undefined) {
          var key = 'DisplayColumn_' + payload.columnName
          payload.row[key] = payload.displayColumn
        }
      }
    },
    notifyRowTableChange: (state, payload) => {
      payload.record = payload.record.map(itemRecord => {
        if (payload.isNew && isEmptyValue(itemRecord.UUID)) {
          return payload.newRow
        }
        return itemRecord
      })
    },
    setRecentItems(state, payload) {
      state.recentItems = payload
    },
    setPageNumber(state, payload) {
      payload.data.pageNumber = payload.pageNumber
    },
    setRecordDetail(state, payload) {
      var isFinded = false
      state.recordDetail = state.recordDetail.map(itemData => {
        if (itemData.uuid === payload.uuid) {
          isFinded = true
          var newValues = Object.assign(itemData.data, payload.data)
          payload.data = newValues
          return payload
        }
        return itemData
      })
      if (!isFinded) {
        state.recordDetail.push(payload)
      }
    },
    addNewRow(state, payload) {
      payload.data = payload.data.push(payload.values)
    }
  },
  actions: {
    setPageNumber({ commit, state, dispatch, rootGetters }, parameters) {
      var data = state.recordSelection.find(recordItem => {
        return recordItem.containerUuid === parameters.containerUuid
      })
      commit('setPageNumber', {
        data: data,
        pageNumber: parameters.pageNumber
      })
      if (parameters.panelType === 'window') {
        dispatch('getDataListTab', {
          parentUuid: parameters.parentUuid,
          containerUuid: parameters.containerUuid
        })
      } else if (parameters.panelType === 'browser') {
        if (rootGetters.isReadyForSubmit(parameters.containerUuid)) {
          dispatch('getBrowserSearch', {
            containerUuid: parameters.containerUuid,
            clearSelection: true
          })
            .catch(error => {
              console.warn(error)
            })
        }
      }
    },
    addNewRow({ commit, getters, rootGetters }, parameters) {
      var data = getters.getDataRecordsList(parameters.containerUuid)
      var values = rootGetters.getColumnNamesAndValues(parameters.containerUuid, 'parsedDefaultValue', true)
      values.isEdit = true
      commit('addNewRow', {
        values: values,
        data: data
      })
    },
    recordSelection({ commit, state }, parameters) {
      var index = state.recordSelection.findIndex(recordItem => {
        return recordItem.containerUuid === parameters.containerUuid
      })
      commit('recordSelection', {
        ...parameters,
        index: index
      })
    },
    deleteRecordContainer({ commit, state }, containerUuid) {
      var record = state.recordSelection.filter(itemRecord => {
        return itemRecord.containerUuid !== containerUuid
      })
      commit('deleteRecordContainer', record)
    },
    getEntity: ({ commit, dispatch }, parameters) => {
      return new Promise((resolve, reject) => {
        getObject(parameters.tableName, parameters.recordUuid)
          .then(response => {
            var map = response.getValuesMap()
            var newValues = convertValuesMapToObject(map)
            const responseConvert = {
              data: newValues,
              id: response.getId(),
              uuid: response.getUuid(),
              tableName: parameters.tableName
            }

            commit('setRecordDetail', responseConvert)
            resolve(newValues)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /**
     * Request list to view in table
     * @param {string} params.tableName, table name to search record data
     * @param {string} params.criteria, criteria to search record data
     */
    getObjectListFromCriteria: ({ dispatch, rootGetters }, objectParams) => {
      var allData = rootGetters.getDataRecordAndSelection(objectParams.containerUuid)

      var nextPageToken
      if (!isEmptyValue(allData.nextPageToken)) {
        nextPageToken = allData.nextPageToken + '-' + allData.pageNumber
      }

      return new Promise((resolve, reject) => {
        getObjectListFromCriteria({
          tableName: objectParams.tableName,
          query: objectParams.query,
          whereClause: objectParams.whereClause,
          orderByClause: objectParams.orderByClause,
          nextPageToken: nextPageToken
        })
          .then(response => {
            const recordList = response.getRecordsList()
            var record = recordList.map(itemRecord => {
              const map = itemRecord.getValuesMap()
              var values = convertValuesMapToObject(map)
              return values
            })

            var token = response.getNextPageToken()
            if (token !== undefined) {
              token = token.slice(0, -2)
              if (token.substr(-1, 1) === '-') {
                token = token.slice(0, -1)
              }
            }

            var pageNumber = rootGetters.getPageNumber(objectParams.containerUuid)
            dispatch('recordSelection', {
              containerUuid: objectParams.containerUuid,
              record: record,
              selection: allData.selection,
              recordCount: response.getRecordcount(),
              nextPageToken: token,
              pageNumber: pageNumber
            })
            resolve(record)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getRecentItemsFromServer: ({ commit }) => {
      return new Promise((resolve, reject) => {
        getRecentItems()
          .then(response => {
            var recentItemsList = response.getRecentitemsList()
            var recentItems = recentItemsList.map(item => {
              var tabUuid = item.getTabuuid()
              return {
                displayName: item.getDisplayname(),
                menuUuid: item.getMenuuuid(),
                menuName: item.getMenuname(),
                windowUuid: item.getWindowuuid(),
                tableId: item.getTableid(),
                recordId: item.getRecordid(),
                uuidRecord: item.getRecorduuid(),
                tabUuid: tabUuid,
                updated: new Date(item.getUpdated()),
                description: item.getMenudescription()
              }
            })
            commit('setRecentItems', recentItems)
            resolve(recentItems)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    notifyRowTableChange: ({ commit, state }, objectParams) => {
      var recordSelection = state.recordSelection.find(recordItem => {
        return recordItem.containerUuid === objectParams.containerUuid
      })

      var newRow = {
        ...objectParams.row,
        isEdit: true
      }
      commit('notifyRowTableChange', {
        isNew: objectParams.isNew,
        newRow: newRow,
        record: recordSelection.record
      })
    },
    notifyCellTableChange: ({ commit, state, dispatch, rootGetters }, objectParams) => {
      var recordSelection = state.recordSelection.find(recordItem => {
        return recordItem.containerUuid === objectParams.containerUuid
      })
      var row = recordSelection.record.find(itemRecord => {
        return itemRecord[objectParams.keyColumn] === objectParams.rowKey
      })
      var rowSelection = recordSelection.selection.find(itemRecord => {
        return itemRecord[objectParams.keyColumn] === objectParams.rowKey
      })
      commit('notifyCellTableChange', {
        row: row,
        value: objectParams.newValue,
        columnName: objectParams.columnName,
        displayColumn: objectParams.displayColumn
      })

      if (objectParams.panelType === 'browser') {
        commit('notifyCellSelectionChange', {
          row: rowSelection,
          value: objectParams.newValue,
          columnName: objectParams.columnName,
          displayColumn: objectParams.displayColumn
        })
      }
      var isReady = rootGetters.isReadyForSubmitRowTable(objectParams.containerUuid, row)
      if (objectParams.panelType === 'window') {
        if (isReady) {
          if (!isEmptyValue(row.UUID)) {
            dispatch('updateCurrentEntityFromTable', {
              parentUuid: objectParams.parentUuid,
              containerUuid: objectParams.containerUuid,
              row: row
            })
          } else {
            dispatch('createEntityFromTable', {
              parentUuid: objectParams.parentUuid,
              containerUuid: objectParams.containerUuid,
              row: row
            })
              .then(resolve => {
                // refresh record list
                dispatch('getDataListTab', {
                  parentUuid: objectParams.parentUuid,
                  containerUuid: objectParams.containerUuid
                })
              })
          }
        }
      }
    }
  },
  getters: {
    getDataRecordAndSelection: (state, rootGetters) => (containerUuid) => {
      var data = state.recordSelection.find(itemRecord => {
        return itemRecord.containerUuid === containerUuid
      })
      if (data) {
        return data
      }
      return {
        containerUuid: containerUuid,
        record: [],
        recordCount: 0,
        selection: [],
        pageNumber: 1
      }
    },
    getDataRecordsList: (state, getters) => (containerUuid) => {
      var data = getters.getDataRecordAndSelection(containerUuid)
      return data.record
    },
    getDataRecordCount: (state, getters) => (containerUuid) => {
      var data = getters.getDataRecordAndSelection(containerUuid)
      if (data.recordCount === undefined) {
        return data.record.length
      }
      return data.recordCount
    },
    getPageNextToken: (state, getters) => (containerUuid) => {
      var data = getters.getDataRecordAndSelection(containerUuid)
      return data.nextPageToken
    },
    getDataRecordSelection: (state, getters) => (containerUuid) => {
      var selection = getters.getDataRecordAndSelection(containerUuid)
      return selection.selection
    },
    getPageNumber: (state, getters) => (containerUuid) => {
      var data = getters.getDataRecordAndSelection(containerUuid)
      return data.pageNumber
    },
    getRowData: (state, getters) => (containerUuid, recordUuid) => {
      var data = getters.getDataRecordsList(containerUuid)
      if (data) {
        var row = data.find(itemData => {
          if (itemData.UUID === recordUuid) {
            return true
          }
        })
        return row
      }
      return undefined
    },
    getRecordDetail: (state) => (parameters) => {
      var data = state.recordDetail.find(itemData => {
        if (itemData.uuid === parameters.recordUuid) {
          return true
        }
      })
      if (data) {
        return data.data
      }
      return {}
    },
    /**
     * Getter converter selection data record in format
     * [
     *  {
     *    selectionId: keyColumn Value,
     *    selectionValues: [
     *      { columname, value },
     *      { columname, value },
     *      { columname, value }
     *    ]
     *  },
     *  {
     *    selectionId: keyColumn Value,
     *    selectionValues: [
     *      { columname, value },
     *      { columname, value }
     *    ]
     *  }
     * ]
     */
    getSelectionToServer: (state, getters, rootState, rootGetters) => (containerUuid) => {
      var selectionToServer = []
      var data = getters.getDataRecordAndSelection(containerUuid)
      if (data.selection.length > 0) {
        var panel = rootGetters.getPanel(containerUuid)
        var keyColumn = panel.keyColumn

        data.selection.forEach(itemRow => {
          var records = []

          Object.keys(itemRow).forEach(key => {
            records.push({
              columnName: key,
              value: itemRow[key]
            })
          })

          selectionToServer.push({
            selectionId: itemRow[keyColumn],
            selectionValues: records
          })
        })
      }
      return selectionToServer
    },
    getRecentItems: (state) => {
      return state.recentItems
    },
    getLanguageList: (state) => (roleUuid) => {
      var languageList = state.recordSelection.find(
        record => record.containerUuid === roleUuid
      )
      return languageList || []
    }
  }
}

export default data
