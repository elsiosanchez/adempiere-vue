import { createEntity, updateEntity, deleteEntity, getReferencesList } from '@/api/ADempiere'
import { convertObjectToArrayPairs, convertValuesMapToObject, isEmptyValue, parseContext, showMessage } from '@/utils/ADempiere'
import language from '@/lang'
import router from '@/router'

const windowControl = {
  state: {
    inCreate: [],
    references: []
  },
  mutations: {
    addInCreate(state, payload) {
      state.inCreate.push(payload)
    },
    deleteInCreate(state, payload) {
      state.inCreate = state.inCreate.filter(item => item.containerUuid !== payload.containerUuid)
    },
    addReference(state, payload) {
      state.references.push(payload)
    },
    deleteReference(state, payload) {
      state.references = state.references.filter(itemReference => {
        if (itemReference.parentUuid === payload.windowUuid &&
          itemReference.recordUuid === payload.recordUuid) {
          return false
        }
        return true
      })
    }
  },
  actions: {
    resetPanelToNew({ dispatch, rootGetters }, parameters) {
      var defaultAttributes = rootGetters.getColumnNamesAndValues({
        containerUuid: parameters.containerUuid,
        propertyName: 'parsedDefaultValue',
        isObjectReturn: true,
        isAddDisplayColumn: true
      })

      // redirect to create new record
      const oldRoute = router.app._route
      router.push({
        name: oldRoute.name,
        query: {
          action: 'create-new',
          tabNumber: oldRoute.query.tabNumber
        }
      })

      dispatch('notifyPanelChange', {
        containerUuid: parameters.containerUuid,
        newValues: defaultAttributes,
        isDontSendToEdit: true
      })
    },
    undoPanelToNew({ dispatch, rootGetters }, parameters) {
      var oldAttributes = rootGetters.getColumnNamesAndValues({
        containerUuid: parameters.containerUuid,
        propertyName: 'oldValue',
        isObjectReturn: true,
        isAddDisplayColumn: true
      })
      dispatch('notifyPanelChange', {
        containerUuid: parameters.containerUuid,
        newValues: oldAttributes
      })
    },
    createNewEntity({ commit, dispatch, getters, rootGetters }, parameters) {
      return new Promise((resolve, reject) => {
        // exists some call to create new record with container uuid
        if (getters.getInCreate(parameters.containerUuid)) {
          return reject({
            error: 0,
            message: `In this panel (${parameters.containerUuid}) is a create new record in progress`
          })
        }

        var panel = rootGetters.getPanel(parameters.containerUuid)
        // delete key from attributes
        var finalAttributes = rootGetters.getColumnNamesAndValues({
          containerUuid: parameters.containerUuid,
          propertyName: 'value',
          isEvaluateValues: true,
          isAddDisplayColumn: true
        })

        commit('addInCreate', {
          containerUuid: parameters.containerUuid,
          tableName: panel.tableName,
          attributesList: finalAttributes
        })
        createEntity({
          tableName: panel.tableName,
          attributesList: finalAttributes
        })
          .then(response => {
            var newValues = convertValuesMapToObject(response.getValuesMap())
            finalAttributes.forEach((element) => {
              if (element.columnName.includes('DisplayColumn')) {
                newValues[element.columnName] = element.value
              }
            })
            var result = {
              data: newValues,
              recordUuid: response.getUuid(),
              recordId: response.getId(),
              tableName: response.getTablename()
            }
            showMessage({
              message: language.t('data.createRecordSuccessful'),
              type: 'success'
            })

            // update fields with new values
            dispatch('notifyPanelChange', {
              containerUuid: parameters.containerUuid,
              newValues: newValues,
              isDontSendToEdit: true
            })
            dispatch('addNewRow', {
              containerUuid: parameters.containerUuid,
              isPanelValues: true,
              isEdit: false
            })
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
          .finally(() => {
            commit('deleteInCreate', {
              containerUuid: parameters.containerUuid,
              tableName: panel.tableName,
              attributesList: finalAttributes
            })
          })
      })
    },
    createEntityFromTable({ commit, dispatch, rootGetters }, parameters) {
      return new Promise((resolve, reject) => {
        var panel = rootGetters.getPanel(parameters.containerUuid)

        // TODO: Add support to Binary columns (BinaryData)
        const columnsToDontSend = ['BinaryData']

        // attributes or fields
        var finalAttributes = convertObjectToArrayPairs(parameters.row)
        finalAttributes = finalAttributes.filter(itemAttribute => {
          if (isEmptyValue(itemAttribute.value)) {
            return false
          }
          if (columnsToDontSend.includes(itemAttribute.columnName) || itemAttribute.columnName.includes('DisplayColumn')) {
            return false
          }
          return true
        })
        createEntity({
          tableName: panel.tableName,
          attributesList: finalAttributes
        })
          .then(response => {
            var newValues = convertValuesMapToObject(response.getValuesMap())

            var result = {
              data: newValues,
              recordUuid: response.getUuid(),
              recordId: response.getId(),
              tableName: response.getTablename()
            }
            showMessage({
              message: language.t('data.createRecordSuccessful'),
              type: 'success'
            })
            // redirect to create new record
            var oldRoute = router.app._route
            router.push({
              name: oldRoute.name,
              query: {
                action: result.recordUuid,
                tabNumber: oldRoute.query.tabNumber
              }
            })
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    updateCurrentEntity({ commit, dispatch, rootGetters }, parameters) {
      return new Promise((resolve, reject) => {
        const panel = rootGetters.getPanel(parameters.containerUuid)
        const recordUuid = rootGetters.getUuid(parameters.containerUuid)

        // TODO: Add support to Binary columns (BinaryData)
        const columnsToDontSend = ['BinaryData']

        // attributes or fields
        var finalAttributes = rootGetters.getColumnNamesAndValues({
          containerUuid: parameters.containerUuid,
          propertyName: 'value' // 'oldValue'
        })

        finalAttributes = finalAttributes.filter(itemAttribute => {
          if (columnsToDontSend.includes(itemAttribute.columnName)) {
            return false
          }
          var field = panel.fieldList.find(itemField => itemField.columnName === itemAttribute.columnName)
          if (!field || !field.isUpdateable || !field.isDisplayed) {
            return false
          }
          return true
        })

        updateEntity({
          tableName: panel.tableName,
          recordUuid: recordUuid,
          attributesList: finalAttributes
        })
          .then(response => {
            const newValues = convertValuesMapToObject(response.getValuesMap())
            const responseConvert = {
              data: newValues,
              id: response.getId(),
              uuid: recordUuid,
              tableName: panel.tableName
            }

            commit('setRecordDetail', responseConvert)
            resolve(newValues)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    updateCurrentEntityFromTable({ commit, dispatch, rootGetters }, parameters) {
      const panel = rootGetters.getPanel(parameters.containerUuid)

      // TODO: Add support to Binary columns (BinaryData)
      const columnsToDontSend = ['BinaryData']

      // attributes or fields
      var finalAttributes = convertObjectToArrayPairs(parameters.row)
      finalAttributes = finalAttributes.filter(itemAttribute => {
        if (columnsToDontSend.includes(itemAttribute.columnName) || itemAttribute.columnName.includes('DisplayColumn')) {
          return false
        }
        var field = panel.fieldList.find(itemField => itemField.columnName === itemAttribute.columnName)
        if (!field || !field.isUpdateable || !field.isDisplayed) {
          return false
        }
        return true
      })

      updateEntity({
        tableName: panel.tableName,
        recordUuid: parameters.row.UUID,
        attributesList: finalAttributes
      })
        .then(response => {
          console.log('Successful edition', response)
        })
        .catch(error => {
          console.warn(error)
        })
    },
    /**
     * Update record after run process associated with window
     * @param {object} parameters
     * @param {string} parameters.parentUuid
     * @param {string} parameters.containerUuid
     * @param {object} parameters.tab
     */
    updateRecordAfterRunProcess({ dispatch, rootGetters }, parameters) {
      const recordUuid = rootGetters.getUuid(parameters.containerUuid)
      // get new values
      dispatch('getEntity', {
        parentUuid: parameters.parentUuid,
        containerUuid: parameters.containerUuid,
        tableName: parameters.tab.tableName,
        recordUuid: recordUuid
      })
        .then(response => {
          // update panel
          if (parameters.tab.isParentTab) {
            dispatch('notifyPanelChange', {
              parentUuid: parameters.parentUuid,
              containerUuid: parameters.containerUuid,
              newValues: response,
              isDontSendToEdit: true
            })
          }
          // update row in table
          dispatch('notifyRowTableChange', {
            parentUuid: parameters.parentUuid,
            containerUuid: parameters.containerUuid,
            row: response,
            isEdit: false
          })
        })
    },
    deleteEntity({ commit, dispatch, rootGetters }, parameters) {
      return new Promise((resolve, reject) => {
        var panel = rootGetters.getPanel(parameters.containerUuid)
        var recordUuid = rootGetters.getUuid(parameters.containerUuid)

        deleteEntity({
          tableName: panel.tableName,
          recordUuid: recordUuid
        })
          .then(response => {
            const oldRoute = router.app._route

            // clear fields with default values
            dispatch('resetPanelToNew', {
              containerUuid: parameters.containerUuid
            })

            // TODO: Verify if necessary
            // delete view with uuid record delete
            dispatch('tagsView/delView', oldRoute, true)

            // refresh record list
            dispatch('getDataListTab', {
              parentUuid: parameters.parentUuid,
              containerUuid: parameters.containerUuid
            })
            showMessage({
              message: language.t('data.deleteRecordSuccessful'),
              type: 'success'
            })

            resolve(response)
          })
          .catch(error => {
            showMessage({
              message: language.t('data.deleteRecordError'),
              type: 'error'
            })
            console.warn('Delete Entity - Error ', error.message, ', Code:', error.code)
            reject(error)
          })
      })
    },
    /**
     * Delete selection records in table
     * @param {string} parameters.containerUuid
     * @param {string} parameters.parentUuid
     */
    deleteSelectionDataList({ dispatch, rootGetters }, parameters) {
      var allData = rootGetters.getDataRecordAndSelection(parameters.containerUuid)
      var tab = rootGetters.getTab(parameters.parentUuid, parameters.containerUuid)
      var selectionLength = allData.selection.length

      allData.selection.forEach((record, index) => {
        // validate if the registry row has no uuid before sending to the server
        if (isEmptyValue(record.UUID)) {
          selectionLength = selectionLength - 1
          console.warn(`This row does not contain a record with UUID`, record)
          // refresh record list
          dispatch('getDataListTab', {
            parentUuid: parameters.parentUuid,
            containerUuid: parameters.containerUuid
          })
          return
        }
        deleteEntity({
          tableName: tab.tableName,
          recordUuid: record.UUID
        })
          .then(() => {
            // redirect to create new record
            var oldRoute = router.app._route
            if (record.UUID === oldRoute.query.action) {
              router.push({
                name: oldRoute.name,
                query: {
                  action: 'create-new',
                  tabNumber: oldRoute.query.tabNumber
                }
              })
              // clear fields with default values
              dispatch('resetPanelToNew', {
                containerUuid: parameters.containerUuid
              })
              // delete view with uuid record delete
              dispatch('tagsView/delView', oldRoute, true)
            }

            if ((index + 1) >= selectionLength) {
              // refresh record list
              dispatch('getDataListTab', {
                parentUuid: parameters.parentUuid,
                containerUuid: parameters.containerUuid
              })
            }
          })
      })
    },
    /**
     * Get data to table in tab
     * @param {string}  parameters.parentUuid, window to search record data
     * @param {string}  parameters.containerUuid, tab to search record data
     * @param {boolean} parameters.clearSelection, clear selection after search
     */
    getDataListTab({ commit, dispatch, rootGetters }, parameters) {
      return new Promise((resolve, reject) => {
        var tab = rootGetters.getTab(parameters.parentUuid, parameters.containerUuid)
        var parsedQuery = parseContext({
          parentUuid: parameters.parentUuid,
          containerUuid: parameters.containerUuid,
          value: tab.query
        })

        var parsedWhereClause
        if (!isEmptyValue(tab.whereClause)) {
          parsedWhereClause = parseContext({
            parentUuid: parameters.parentUuid,
            containerUuid: parameters.containerUuid,
            value: tab.whereClause
          })
        }
        dispatch('getObjectListFromCriteria', {
          parentUuid: parameters.parentUuid,
          containerUuid: parameters.containerUuid,
          tableName: tab.tableName,
          query: parsedQuery,
          whereClause: parsedWhereClause,
          orderByClause: tab.orderByClause
        })
          .then(response => {
            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /**
     * Get references asociate to record
     * @param {string} parameters.parentUuid
     * @param {string} parameters.containerUuid
     * @param {string} parameters.recordUuid
     */
    getReferencesListFromServer({ commit, rootGetters }, parameters) {
      // TODO: check if you get better performance search only the window and get the current tab
      const tab = rootGetters.getTab(parameters.parentUuid, parameters.containerUuid)
      return new Promise((resolve, reject) => {
        getReferencesList({
          windowUuid: parameters.parentUuid,
          tableName: tab.tableName,
          recordUuid: parameters.recordUuid
        })
          .then(response => {
            // commit('deleteReference')
            console.log(response)
            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  },
  getters: {
    getInCreate: (state) => (containerUuid) => {
      return state.inCreate.find(item => item.containerUuid === containerUuid)
    },
    getReferencesList: (state) => (windowUuid, recordUuid) => {
      return state.references.filter(itemReference => {
        if (itemReference.parentUuid === windowUuid &&
          itemReference.recordUuid === recordUuid) {
          return true
        }
      })
    }
  }
}

export default windowControl
