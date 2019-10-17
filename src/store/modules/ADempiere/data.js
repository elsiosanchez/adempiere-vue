import { getObject, getObjectListFromCriteria, getRecentItems } from '@/api/ADempiere'
import { convertValuesMapToObject, isEmptyValue, showMessage } from '@/utils/ADempiere'
import language from '@/lang'

const data = {
  state: {
    recordSelection: [], // record data and selection
    recordDetail: [],
    recentItems: [],
    inGetting: []
  },
  mutations: {
    addInGetting(state, payload) {
      state.inGetting.push(payload)
    },
    deleteInGetting(state, payload) {
      state.inGetting = state.inGetting.filter(item => item.containerUuid !== payload.containerUuid)
    },
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
        if (!rootGetters.isNotReadyForSubmit(parameters.containerUuid)) {
          dispatch('getBrowserSearch', {
            containerUuid: parameters.containerUuid,
            isClearSelection: true
          })
            .catch(error => {
              console.warn(error)
            })
        }
      }
    },
    /**
     * Insert new row bottom list table, used only from window
     * @param {string}  parentUuid
     * @param {string}  containerUuid
     * @param {boolean} isPanelValues, define if used values form panel
     * @param {boolean} isEdit, define if used values form panel
     */
    addNewRow({ commit, getters, rootGetters }, parameters) {
      const { parentUuid, containerUuid, isPanelValues = false, isEdit = true } = parameters

      const data = getters.getDataRecordsList(containerUuid)
      // add row with default values to create new record
      var propertyName = 'parsedDefaultValue'
      if (isPanelValues) {
        // add row with values used from record in panel
        propertyName = 'value'
      }
      var values = rootGetters.getColumnNamesAndValues({
        containerUuid: containerUuid,
        propertyName: propertyName,
        isObjectReturn: true,
        isAddDisplayColumn: true
      })
      values.isEdit = isEdit

      var linkColumnName
      // get the link column name from the tab
      const tab = rootGetters.getPanel(containerUuid)
      linkColumnName = tab.linkColumnName
      if (isEmptyValue(linkColumnName)) {
        // get the link column name from field list
        const fieldLink = tab.fieldList.find(item => item.isParent)
        if (fieldLink) {
          linkColumnName = fieldLink.columnName
        }
      }

      // get context value if link column exists and does not exist in row
      if (!isEmptyValue(linkColumnName) && isEmptyValue(values[linkColumnName])) {
        values[linkColumnName] = rootGetters.getContext({
          parentUuid: parentUuid,
          containerUuid: containerUuid,
          columnName: linkColumnName
        })
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
    setRecordSelection({ commit, state }, parameters) {
      var index = state.recordSelection.findIndex(recordItem => {
        return recordItem.containerUuid === parameters.containerUuid
      })
      commit('setRecordSelection', {
        ...parameters,
        isLoaded: true,
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
     * @param {string} viewUuid // As parentUuid in window
     * @param {array} withOut
     */
    deleteRecordContainer({ commit, state }, {
      viewUuid,
      withOut = []
    }) {
      const record = state.recordSelection.filter(itemRecord => {
        // ignore this uuid
        if (withOut.includes(itemRecord.containerUuid)) {
          return true
        }
        // remove window and tabs data
        if (itemRecord.parentUuid) {
          return itemRecord.parentUuid !== viewUuid
        }
        // remove browser data
        return itemRecord.containerUuid !== viewUuid
      })
      commit('deleteRecordContainer', record)
    },
    /**
     * @param {string} tableName
     * @param {string} recordUuid
     */
    getEntity({ commit }, parameters) {
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
     * TODO: Join with getDataListTab action
     * @param {string} parentUuid, uuid from window
     * @param {string} containerUuid, uuid from tab
     * @param {string} tableName, table name to search record data
     * @param {string} query, criteria to search record data
     * @param {string} whereClause, criteria to search record data
     * @param {string} orderByClause, criteria to search record data
     * @param {array}  conditions, conditions to criteria
     */
    getObjectListFromCriteria({ commit, dispatch, getters }, {
      parentUuid,
      containerUuid,
      tableName,
      query,
      whereClause,
      orderByClause,
      conditions = []
    }) {
      var allData = getters.getDataRecordAndSelection(containerUuid)

      var nextPageToken
      if (!isEmptyValue(allData.nextPageToken)) {
        nextPageToken = allData.nextPageToken + '-' + allData.pageNumber
      }

      commit('addInGetting', {
        containerUuid: containerUuid,
        tableName: tableName,
        conditions: conditions
      })
      return new Promise((resolve, reject) => {
        getObjectListFromCriteria({
          tableName: tableName,
          query: query,
          whereClause: whereClause,
          conditions: conditions,
          orderByClause: orderByClause,
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
              parentUuid: parentUuid,
              containerUuid: containerUuid,
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
          .finally(() => {
            commit('deleteInGetting', {
              containerUuid: containerUuid,
              tableName: tableName
            })
          })
      })
    },
    getRecentItemsFromServer({ commit }) {
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
    /**
     * @param {object} objectParams
     * @param {string} objectParams.containerUuid
     * @param {objec}  objectParams.row, new data to change
     * @param {objec}  objectParams.isEdit, if the row displayed to edit mode
     * @param {objec}  objectParams.isNew, if insert data to new row
     */
    notifyRowTableChange({ commit, state, getters, rootGetters }, objectParams) {
      var currentValues = rootGetters.getColumnNamesAndValues({
        containerUuid: objectParams.containerUuid,
        propertyName: 'value',
        isObjectReturn: true,
        isAddDisplayColumn: true
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
    notifyCellTableChange({ commit, state, dispatch, rootGetters, isDontSendToEdit = false }, objectParams) {
      const { parentUuid, containerUuid, panelType = 'window', columnName, rowKey, keyColumn, newValue, displayColumn } = objectParams
      const recordSelection = state.recordSelection.find(recordItem => {
        return recordItem.containerUuid === containerUuid
      })
      const row = recordSelection.record.find(itemRecord => {
        return itemRecord[keyColumn] === rowKey
      })
      const rowSelection = recordSelection.selection.find(itemRecord => {
        return itemRecord[keyColumn] === rowKey
      })
      commit('notifyCellTableChange', {
        row: row,
        value: objectParams.newValue,
        columnName: objectParams.columnName,
        displayColumn: objectParams.displayColumn
      })

      if (panelType === 'browser') {
        commit('notifyCellSelectionChange', {
          row: rowSelection,
          value: newValue,
          columnName: columnName,
          displayColumn: displayColumn
        })
      }
      if (!isDontSendToEdit) {
        if (panelType === 'window') {
          const fieldNotReady = rootGetters.isNotReadyForSubmit(containerUuid, row)
          if (!fieldNotReady) {
            if (!isEmptyValue(row.UUID)) {
              dispatch('updateCurrentEntityFromTable', {
                parentUuid: parentUuid,
                containerUuid: containerUuid,
                row: row
              })
            } else {
              dispatch('createEntityFromTable', {
                parentUuid: parentUuid,
                containerUuid: containerUuid,
                row: row
              })
                .then(() => {
                  // refresh record list
                  dispatch('getDataListTab', {
                    parentUuid: parentUuid,
                    containerUuid: containerUuid
                  })
                })
            }
          } else {
            const fieldsEmpty = rootGetters.getFieldListEmptyMandatory({
              containerUuid: containerUuid,
              row: row
            })
            showMessage({
              message: language.t('notifications.mandatoryFieldMissing') + fieldsEmpty,
              type: 'info'
            })
          }
        }
      }
    }
  },
  getters: {
    getInGetting: (state) => (containerUuid) => {
      return state.inGetting.find(item => item.containerUuid === containerUuid)
    },
    /**
     * Used by datatables in tab children, record navigation in window, result in browser
     * @param {string} containerUuid
     */
    getDataRecordAndSelection: (state, getters) => (containerUuid) => {
      return state.recordSelection.find(itemRecord => {
        return itemRecord.containerUuid === containerUuid
      }) || {
        containerUuid: containerUuid,
        record: [],
        recordCount: 0,
        selection: [],
        pageNumber: 1,
        nextPageToken: undefined,
        isLoaded: false // Boolean(false || getters.getInGetting(containerUuid))
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
      if (dataList.selection.length) {
        const panel = rootGetters.getPanel(containerUuid)

        dataList.selection.forEach(itemRow => {
          var records = []

          Object.keys(itemRow).forEach(key => {
            if (!key.includes('DisplayColumn') && !withOut.includes(key)) {
              // evaluate metadata attributes before to convert
              const field = panel.fieldList.find(itemField => itemField.columnName === key)
              if (field && (field.isIdentifier || field.isUpdateable)) {
                records.push({
                  columnName: key,
                  value: itemRow[key]
                })
              }
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
