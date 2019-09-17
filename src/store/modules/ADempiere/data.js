import { getObject, getObjectListFromCriteria, getRecentItems } from '@/api/ADempiere'
import { convertValuesMapToObject, isEmptyValue } from '@/utils/ADempiere'

const data = {
  state: {
    recordSelection: [], // record data and selection
    recordDetail: [],
    recentItems: []
  },
  mutations: {
    setRecordSelection(state, payload) {
      if (payload.index > -1 && payload.index !== undefined) {
        state.recordSelection.splice(payload.index, 1, payload)
      } else {
        state.recordSelection.push(payload)
      }
    },
    setSelection(state, payload) {
      payload.data.selection = payload.newSelection
    },
    deleteRecordContainer(state, payload) {
      state.recordSelection = payload
    },
    notifyCellTableChange: (state, payload) => {
      payload.row[payload.columnName] = payload.value
      if (payload.displayColumn !== undefined) {
        const key = 'DisplayColumn_' + payload.columnName
        payload.row[key] = payload.displayColumn
      }
    },
    notifyCellSelectionChange: (state, payload) => {
      if (payload.row !== undefined) {
        payload.row[payload.columnName] = payload.value
        if (payload.displayColumn !== undefined) {
          const key = 'DisplayColumn_' + payload.columnName
          payload.row[key] = payload.displayColumn
        }
      }
    },
    notifyRowTableChange: (state, payload) => {
      Object.assign(payload.row, payload.newRow)
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
    /**
     * Set page number of pagination list
     * @param {string}  parameters.parentUuid
     * @param {string}  parameters.containerUuid
     * @param {integer} parameters.panelType
     * @param {string}  parameters.pageNumber
     */
    setPageNumber({ commit, state, dispatch, rootGetters }, parameters) {
      const data = state.recordSelection.find(recordItem => {
        return recordItem.containerUuid === parameters.containerUuid
      })
      commit('setPageNumber', {
        data: data,
        pageNumber: parameters.pageNumber
      })

      // refresh list table with data from server
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
    /**
     * Insert new row bottom list table, used only from window
     * @param {string}  containerUuid
     * @param {boolean} isPanelValues, define if used values form panel
     * @param {boolean} isEdit, define if used values form panel
     */
    addNewRow({ commit, getters, rootGetters }, parameters) {
      const data = getters.getDataRecordsList(parameters.containerUuid)
      // add row with default values to create new record
      var propertyName = 'parsedDefaultValue'
      if (parameters.isPanelValues) {
        // add row with values used from record in panel
        propertyName = 'value'
      }
      var values = rootGetters.getColumnNamesAndValues({
        containerUuid: parameters.containerUuid,
        propertyName: propertyName,
        isObjectReturn: true,
        isAddDisplayColumn: true
      })

      values.isEdit = true
      if (parameters.hasOwnProperty('isEdit')) {
        values.isEdit = parameters.isEdit
      }

      commit('addNewRow', {
        values: values,
        data: data
      })
    },
    /**
     * Set record, selection, page number, token, and record count, with container uuid
     * TODO: Refactor and optimize the mutation of state
     * @param {string}  parameters.containerUuid
     * @param {array}   parameters.record
     * @param {array}   parameters.selection
     * @param {integer} parameters.pageNumber
     * @param {string}  parameters.nextPageToken
     */
    setRecordSelection({ commit, state, getters }, parameters) {
      var index = state.recordSelection.findIndex(recordItem => {
        return recordItem.containerUuid === parameters.containerUuid
      })
      commit('setRecordSelection', {
        ...parameters,
        index: index
      })
    },
    /**
     * Set selection in data list associated in container
     * @param {string} parameters.containerUuid
     * @param {string} parameters.selection
     */
    setSelection({ commit, state, getters }, parameters) {
      const recordSelection = getters.getDataRecordAndSelection(parameters.containerUuid)
      commit('setSelection', {
        newSelection: parameters.selection,
        data: recordSelection
      })
    },
    /**
     * Delete record result in container
     * TODO: Add parent uuid, to delete all data result in tabs children before
     * close some window view.
     * @param {string} containerUuid
     */
    deleteRecordContainer({ commit, state }, containerUuid) {
      const record = state.recordSelection.filter(itemRecord => {
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
            if (!isEmptyValue(token)) {
              token = token.slice(0, -2)
              if (token.substr(-1, 1) === '-') {
                token = token.slice(0, -1)
              }
            } else {
              token = allData.nextPageToken
            }

            dispatch('setRecordSelection', {
              containerUuid: objectParams.containerUuid,
              record: record,
              selection: allData.selection,
              recordCount: response.getRecordcount(),
              nextPageToken: token,
              pageNumber: allData.pageNumber
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
            const recentItems = response.getRecentitemsList().map(item => {
              return {
                displayName: item.getDisplayname(),
                menuUuid: item.getMenuuuid(),
                menuName: item.getMenuname(),
                windowUuid: item.getWindowuuid(),
                tableId: item.getTableid(),
                recordId: item.getRecordid(),
                uuidRecord: item.getRecorduuid(),
                tabUuid: item.getTabuuid(),
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
    notifyRowTableChange: ({ commit, state, getters, rootGetters }, objectParams) => {
      var currentValues = rootGetters.getColumnNamesAndValues({
        containerUuid: objectParams.containerUuid,
        propertyName: 'value',
        isObjectReturn: true
      })
      var row = getters.getRowData(objectParams.containerUuid, currentValues.UUID)

      var isEdit = true
      if (objectParams.hasOwnProperty('isEdit')) {
        isEdit = objectParams.isEdit
      }

      var newRow = {
        ...currentValues,
        // ...objectParams.row,
        isEdit: isEdit
      }
      commit('notifyRowTableChange', {
        isNew: objectParams.isNew,
        newRow: newRow,
        row: row
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
    /**
     * Used by datatables in tab children, record navigation in window, result in browser
     * @param {string} containerUuid
     */
    getDataRecordAndSelection: (state) => (containerUuid) => {
      return state.recordSelection.find(itemRecord => {
        return itemRecord.containerUuid === containerUuid
      }) || {
        containerUuid: containerUuid,
        record: [],
        recordCount: 0,
        selection: [],
        pageNumber: 1,
        nextPageToken: undefined
      }
    },
    getDataRecordsList: (state, getters) => (containerUuid) => {
      return getters.getDataRecordAndSelection(containerUuid).record
    },
    getDataRecordCount: (state, getters) => (containerUuid) => {
      return getters.getDataRecordAndSelection(containerUuid).recordCount
    },
    getPageNextToken: (state, getters) => (containerUuid) => {
      return getters.getDataRecordAndSelection(containerUuid).nextPageToken
    },
    getDataRecordSelection: (state, getters) => (containerUuid) => {
      return getters.getDataRecordAndSelection(containerUuid).selection
    },
    getPageNumber: (state, getters) => (containerUuid) => {
      return getters.getDataRecordAndSelection(containerUuid).pageNumber
    },
    getRowData: (state, getters) => (containerUuid, recordUuid) => {
      return getters.getDataRecordsList(containerUuid).find(itemData => {
        if (itemData.UUID === recordUuid) {
          return true
        }
      })
    },
    /**
     * @returns {object}
     */
    getRecordDetail: (state) => (parameters) => {
      return state.recordDetail.find(itemData => {
        if (itemData.uuid === parameters.recordUuid) {
          return true
        }
      }) || {}
    },
    /**
     * Getter converter selection data record in format
     * @param {string} containerUuid
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
      var dataList = getters.getDataRecordAndSelection(containerUuid)
      const withOut = ['isEdit', 'isSelected']
      if (dataList.selection.length > 0) {
        const panel = rootGetters.getPanel(containerUuid)

        dataList.selection.forEach(itemRow => {
          var records = []

          Object.keys(itemRow).forEach(key => {
            if (!key.includes('DisplayColumn') && !withOut.includes(key)) {
              records.push({
                columnName: key,
                value: itemRow[key]
              })
            }
          })

          selectionToServer.push({
            selectionId: itemRow[panel.keyColumn],
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
      return state.recordSelection.find(
        record => record.containerUuid === roleUuid
      ) || []
    }
  }
}

export default data
