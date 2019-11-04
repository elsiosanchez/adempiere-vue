import Vue from 'vue'
import { getObject, getObjectListFromCriteria, getRecentItems } from '@/api/ADempiere'
import { convertValuesMapToObject, isEmptyValue, showMessage } from '@/utils/ADempiere'
import language from '@/lang'

const data = {
  state: {
    recordSelection: [], // record data and selection
    recordDetail: [],
    recentItems: [],
    inGetting: [],
    forgetPassword: []
  },
  mutations: {
    addInGetting(state, payload) {
      state.inGetting.push(payload)
    },
    addForgetPassword(state, payload) {
      state.forgetPassword.push(payload)
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
    setIsloadContext(state, payload) {
      payload.data.isLoadedContext = payload.isLoadedContext
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
      payload.data = payload.data.unshift(payload.values)
    },
    addDisplayColumn(state, payload) {
      Vue.set(payload.row, payload.columnName, payload.displayColumn)
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
    addNewRow({ commit, getters, rootGetters, dispatch }, parameters) {
      const { parentUuid, containerUuid, isPanelValues = false, isEdit = true, isNew = true } = parameters
      var { fieldList = [] } = parameters

      const tabPanel = rootGetters.getPanel(containerUuid)

      if (!fieldList.length) {
        fieldList = tabPanel.fieldList // rootGetters.getFieldsListFromPanel(containerUuid)
      }

      var values = {}
      // add row with default values to create new record
      if (isPanelValues) {
        // add row with values used from record in panel
        values = rootGetters.getColumnNamesAndValues({
          containerUuid: containerUuid,
          propertyName: 'value',
          isObjectReturn: true,
          isAddDisplayColumn: true,
          fieldList: fieldList
        })
      } else {
        values = getters.getParsedDefaultValues({
          parentUuid: parentUuid,
          containerUuid: containerUuid,
          fieldList: fieldList
        })
      }
      values.isNew = isNew
      values.isEdit = isEdit
      values.isSendServer = false

      // get the link column name from the tab
      var linkColumnName = tabPanel.linkColumnName
      if (isEmptyValue(linkColumnName)) {
        // get the link column name from field list
        linkColumnName = tabPanel.fieldLinkColumnName
      }

      var valueLink
      // get context value if link column exists and does not exist in row
      if (!isEmptyValue(linkColumnName)) {
        valueLink = rootGetters.getContext({
          parentUuid: parentUuid,
          containerUuid: containerUuid,
          columnName: linkColumnName
        })
      }
      if (!isEmptyValue(valueLink)) {
        valueLink = parseInt(valueLink, 10)
      }

      // get display column
      if (fieldList.length) {
        fieldList
          // TODO: Evaluate if is field is read only and FieldSelect
          .filter(itemField => itemField.componentPath === 'FieldSelect')
          .forEach(itemField => {
            var valueGetDisplayColumn = values[itemField.columnName]

            // overwrite value with column link
            if (!isEmptyValue(linkColumnName) && linkColumnName === itemField.columnName) {
              valueGetDisplayColumn = valueLink
            }

            // break this itineration if is empty
            if (isEmptyValue(valueGetDisplayColumn)) {
              return
            }
            // always the values for these types of fields are integers
            if (['TableDirect'].includes(itemField.referenceType)) {
              valueGetDisplayColumn = parseInt(valueGetDisplayColumn, 10)
            } else {
              if (!isNaN(valueGetDisplayColumn)) {
                valueGetDisplayColumn = parseInt(valueGetDisplayColumn, 10)
              }
            }

            // get label (DisplayColumn) from vuex store
            const options = rootGetters.getLookupAll({
              parentUuid: parentUuid,
              containerUuid: containerUuid,
              tableName: itemField.reference.tableName,
              query: itemField.reference.query,
              directQuery: itemField.reference.directQuery,
              value: valueGetDisplayColumn
            })

            const option = options.find(itemOption => itemOption.key === valueGetDisplayColumn)
            // if there is a lookup option, assign the display column with the label
            if (option) {
              values['DisplayColumn_' + itemField.columnName] = option.label
              return
            }
            if (linkColumnName === itemField.columnName) {
              // get context value if link column exists and does not exist in row
              const nameParent = rootGetters.getContext({
                parentUuid: parentUuid,
                containerUuid: containerUuid,
                columnName: 'Name'
              })
              if (nameParent) {
                values['DisplayColumn_' + itemField.columnName] = nameParent
                return
              }
            }
            // get from server
            dispatch('getLookupItemFromServer', {
              parentUuid: parentUuid,
              containerUuid: containerUuid,
              tableName: itemField.reference.tableName,
              directQuery: itemField.reference.directQuery,
              value: valueGetDisplayColumn
            })
              .then(responseLookup => {
                dispatch('addDisplayColumn', {
                  containerUuid: containerUuid,
                  columnName: itemField.columnName,
                  displayColumn: responseLookup.label
                })
              })
          })
      }

      // overwrite value with column link
      if (isEmptyValue(values[linkColumnName])) {
        values[linkColumnName] = valueLink
      }

      const dataStore = getters.getDataRecordsList(containerUuid)
      commit('addNewRow', {
        values: values,
        data: dataStore
      })
    },
    addDisplayColumn({ commit, getters }, parameters) {
      const { containerUuid, columnName, displayColumn } = parameters
      const dataStore = getters.getDataRecordsList(containerUuid)
      const rowRecord = dataStore.find(itemData => itemData.isNew)

      commit('addDisplayColumn', {
        row: rowRecord,
        displayColumn: displayColumn,
        columnName: 'DisplayColumn_' + columnName
      })
    },
    /**
     * Is load context in true when panel is set context
     * @param {string}  parameters.containerUuid
     */
    setIsloadContext({ commit, state }, parameters) {
      const { containerUuid } = parameters
      const data = state.recordSelection.find(recordItem => {
        return recordItem.containerUuid === containerUuid
      })
      if (data) {
        commit('setIsloadContext', {
          data: data,
          isLoadedContext: true
        })
      }
    },
    /**
     * Set record, selection, page number, token, and record count, with container uuid
     * TODO: Refactor and optimize the mutation of state
     * @param {string}  parameters.containerUuid
     * @param {array}   parameters.record
     * @param {array}   parameters.selection
     * @param {integer} parameters.pageNumber
     * @param {integer} parameters.recordCount
     * @param {string}  parameters.nextPageToken
     * @param {string}  parameters.panelType
     */
    setRecordSelection({ commit, state }, parameters) {
      const { parentUuid, containerUuid, record = [], selection = [], pageNumber = 1, recordCount = 0, nextPageToken, panelType = 'window' } = parameters
      var index = state.recordSelection.findIndex(recordItem => {
        return recordItem.containerUuid === containerUuid
      })
      commit('setRecordSelection', {
        parentUuid: parentUuid,
        containerUuid: containerUuid,
        record: record,
        selection: selection,
        pageNumber: pageNumber,
        recordCount: recordCount,
        nextPageToken: nextPageToken,
        panelType: panelType,
        isLoaded: true,
        isLoadedContext: false,
        index: index
      })
    },
    /**
     * Set selection in data list associated in container
     * @param {string} parameters.containerUuid
     * @param {string} parameters.selection
     */
    setSelection({ commit, getters }, parameters) {
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
    deleteRecordContainer({ commit, state, dispatch }, parameters) {
      const { viewUuid, withOut = [], isNew = false } = parameters
      var setNews = []
      const record = state.recordSelection.filter(itemRecord => {
        // ignore this uuid
        if (withOut.includes(itemRecord.containerUuid)) {
          return true
        }
        // remove window and tabs data
        if (itemRecord.parentUuid) {
          if (isNew) {
            setNews.push(itemRecord.containerUuid)
          }
          return itemRecord.parentUuid !== viewUuid
        }
        // remove browser data
        return itemRecord.containerUuid !== viewUuid
      })
      commit('deleteRecordContainer', record)

      if (setNews.length) {
        setNews.forEach(uuid => {
          dispatch('setRecordSelection', {
            parentUuid: viewUuid,
            containerUuid: uuid
          })
        })
      }
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
    getObjectListFromCriteria({ commit, dispatch, getters }, parameters) {
      const { parentUuid, containerUuid, tableName, query, whereClause, orderByClause, conditions = [], isShowNotification = true, isParentTab = true } = parameters
      if (isShowNotification) {
        showMessage({
          title: language.t('notifications.loading'),
          message: language.t('notifications.searching'),
          type: 'info'
        })
      }
      const dataStore = getters.getDataRecordAndSelection(containerUuid)

      var nextPageToken
      if (!isEmptyValue(dataStore.nextPageToken)) {
        nextPageToken = dataStore.nextPageToken + '-' + dataStore.pageNumber
      }

      var inEdited = []
      if (!isParentTab) {
        // TODO: Evaluate peformance to evaluate records to edit
        inEdited = dataStore.record.filter(itemRecord => {
          return itemRecord.isEdit && !itemRecord.isNew
        })
      }

      commit('addInGetting', {
        containerUuid: containerUuid,
        tableName: tableName,
        conditions: conditions
      })
      return getObjectListFromCriteria({
        tableName: tableName,
        query: query,
        whereClause: whereClause,
        conditions: conditions,
        orderByClause: orderByClause,
        nextPageToken: nextPageToken
      })
        .then(response => {
          const recordList = response.getRecordsList()
          const record = recordList.map(itemRecord => {
            var values = convertValuesMapToObject(
              itemRecord.getValuesMap()
            )

            // datatables attribute
            values.isNew = false
            values.isEdit = false
            values.isSelected = false
            values.isReadOnlyFromRow = false

            if (inEdited.find(itemEdit => itemEdit.UUID === values.UUID)) {
              values.isEdit = true
            }
            return values
          })

          var token = response.getNextPageToken()
          if (!isEmptyValue(token)) {
            token = token.slice(0, -2)
            if (token.substr(-1, 1) === '-') {
              token = token.slice(0, -1)
            }
          } else {
            token = dataStore.nextPageToken
          }
          if (isShowNotification) {
            let searchMessage = 'searchWithOutRecords'
            if (record.length) {
              searchMessage = 'succcessSearch'
            }
            showMessage({
              title: language.t('notifications.succesful'),
              message: language.t(`notifications.${searchMessage}`),
              type: 'success'
            })
          }
          dispatch('setRecordSelection', {
            parentUuid: parentUuid,
            containerUuid: containerUuid,
            record: record,
            selection: dataStore.selection,
            recordCount: response.getRecordcount(),
            nextPageToken: token,
            pageNumber: dataStore.pageNumber
          })
          return record
        })
        .catch(error => {
          // Set default registry values so that the table does not say loading,
          // there was already a response from the server
          dispatch('setRecordSelection', {
            parentUuid: parentUuid,
            containerUuid: containerUuid
          })

          if (isShowNotification) {
            showMessage({
              title: language.t('notifications.error'),
              message: error.message,
              type: 'error'
            })
          }
          console.warn('Error Get Object List ' + error.message + '. Code: ' + error.code)
        })
        .finally(() => {
          commit('deleteInGetting', {
            containerUuid: containerUuid,
            tableName: tableName
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
     * forget password
     */
    getForgetPasswordFromServer({ commit }, parameters) {
      // getForgetPassword()
      //   .then(response => {
      //     console.log(response)
      //   })
      //   .catch(error => {
      //     console.log(error)
      //   })
      commit('addForgetPassword', parameters)
    },
    /**
     * TODO: Add support to tab children
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
    notifyCellTableChange({ commit, state, dispatch, rootGetters }, objectParams) {
      const { parentUuid, containerUuid, field, panelType = 'window', isSendToServer = true, columnName, rowKey, keyColumn, newValue, displayColumn } = objectParams
      const recordSelection = state.recordSelection.find(recordItem => {
        return recordItem.containerUuid === containerUuid
      })
      const row = recordSelection.record.find(itemRecord => {
        return itemRecord[keyColumn] === rowKey
      })

      // the field has not changed, then the action is broken
      if (row[columnName] === newValue) {
        return
      }

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
      } else if (panelType === 'window') {
        // request callouts
        if (!isEmptyValue(newValue) && !isEmptyValue(field.callout)) {
          dispatch('getCallout', {
            parentUuid: parentUuid,
            containerUuid: containerUuid,
            tableName: field.tableName,
            columnName: field.columnName,
            callout: field.callout,
            name: field.name,
            value: newValue,
            inTable: true
          })
        }

        if (isSendToServer) {
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
        isLoadedContext: false,
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
    getSelectionToServer: (state, getters, rootState, rootGetters) => (parameters) => {
      var { containerUuid, selection = [] } = parameters
      var selectionToServer = []
      const withOut = ['isEdit', 'isSelected', 'isSendToServer']

      if (selection.length <= 0) {
        selection = getters.getDataRecordSelection(containerUuid)
      }
      if (selection.length) {
        const panel = rootGetters.getPanel(containerUuid)

        selection.forEach(itemRow => {
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
