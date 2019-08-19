import { createEntity, updateEntity, deleteEntity } from '@/api/ADempiere'
import { convertObjectToArrayPairs, convertValuesMapToObject, isEmptyValue, parseContext, showMessage } from '@/utils/ADempiere'
import language from '@/lang'
import router from '@/router'

const windowControl = {
  actions: {
    resetPanelToNew({ dispatch, rootGetters }, parameters) {
      var defaultAttributes = rootGetters.getColumnNamesAndValues(parameters.containerUuid, 'parsedDefaultValue', true)

      dispatch('notifyPanelChange', {
        containerUuid: parameters.containerUuid,
        newValues: defaultAttributes,
        isDontSendToEdit: true
      })
    },
    undoPanelToNew({ dispatch, rootGetters }, parameters) {
      var oldAttributes = rootGetters.getColumnNamesAndValues(parameters.containerUuid, 'oldValue', true)
      dispatch('notifyPanelChange', {
        containerUuid: parameters.containerUuid,
        newValues: oldAttributes
      })
    },
    createNewEntity({ commit, dispatch, rootGetters }, parameters) {
      return new Promise((resolve, reject) => {
        var panel = rootGetters.getPanel(parameters.containerUuid)
        // delete key from attributes
        var finalAttributes = rootGetters.getColumnNamesAndValues(parameters.containerUuid, 'value', false, true)
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

            // update fields with new values
            dispatch('notifyPanelChange', {
              containerUuid: parameters.containerUuid,
              newValues: newValues,
              isDontSendToEdit: true
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
        var panel = rootGetters.getPanel(parameters.containerUuid)
        var recordUuid = rootGetters.getUuid(parameters.containerUuid)

        // TODO: Add support to Binary columns (BinaryData)
        var columnsToDontSend = ['BinaryData']

        // attributes or fields
        var finalAttributes = rootGetters.getColumnNamesAndValues(parameters.containerUuid) //, 'oldValue')
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
            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    updateCurrentEntityFromTable({ commit, dispatch, rootGetters }, parameters) {
      var panel = rootGetters.getPanel(parameters.containerUuid)

      // TODO: Add support to Binary columns (BinaryData)
      var columnsToDontSend = ['BinaryData']

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
          console.log(error)
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
            // clear fields with default values
            dispatch('resetPanelToNew', {
              containerUuid: parameters.containerUuid
            })

            // redirect to create new record
            var oldRoute = router.app._route
            router.push({
              name: oldRoute.name,
              params: {
                action: 'create-new'
              }
            })
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
     *
     * @param {string} parameters.containerUuid
     * @param {string} parameters.parentUuid
     */
    deleteSelectionDataList({ dispatch, rootGetters }, parameters) {
      var allData = rootGetters.getDataRecordAndSelection(parameters.containerUuid)
      // var panel = rootGetters.getPanel(parameters.containerUuid)
      var tab = rootGetters.getTab(parameters.parentUuid, parameters.containerUuid)
      allData.selection.forEach((record, index) => {
        deleteEntity({
          tableName: tab.tableName,
          recordUuid: record.UUID
        })
          .then(() => {
            // redirect to create new record
            var oldRoute = router.app._route
            if (record.UUID === oldRoute.params.action) {
              router.push({
                name: oldRoute.name,
                params: {
                  action: 'create-new'
                }
              })
              // clear fields with default values
              dispatch('resetPanelToNew', {
                containerUuid: parameters.containerUuid
              })
              // delete view with uuid record delete
              dispatch('tagsView/delView', oldRoute, true)
            }

            if ((index + 1) === allData.selection.length) {
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
     *
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
    }
  }
}

export default windowControl
