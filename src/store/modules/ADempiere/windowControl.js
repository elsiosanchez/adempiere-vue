import { createEntity, updateEntity, deleteEntity } from '@/api/ADempiere'
import { convertValuesMapToObject, isEmptyValue, parseContext, showMessage } from '@/utils/ADempiere'
import language from '@/lang'
import router from '@/router'

const windowControl = {
  actions: {
    resetPanelToNew({ dispatch, rootGetters }, params) {
      var defaultAttributes = rootGetters.getColumnNamesAndValues(params.containerUuid, 'parsedDefaultValue', true)

      dispatch('notifyPanelChange', {
        containerUuid: params.containerUuid,
        newValues: defaultAttributes,
        isDontSendToEdit: true
      })
    },
    undoPanelToNew({ dispatch, rootGetters }, params) {
      var oldAttributes = rootGetters.getColumnNamesAndValues(params.containerUuid, 'oldValue', true)
      dispatch('notifyPanelChange', {
        containerUuid: params.containerUuid,
        newValues: oldAttributes
      })
    },
    createNewEntity({ commit, dispatch, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        var panel = rootGetters.getPanel(params.containerUuid)
        // delete key from attributes
        var finalAttributes = rootGetters.getColumnNamesAndValues(params.containerUuid)
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
              containerUuid: params.containerUuid,
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

        // attributes or fields
        var finalAttributes = rootGetters.getColumnNamesAndValuesChanged(parameters.containerUuid)
        updateEntity({
          tableName: panel.tableName,
          recordUuid: recordUuid,
          attributesList: finalAttributes
        })
          .then(response => {
            // var newValues = convertValuesMapToObject(response.getValuesMap())
            // console.info('edit entity sucess', newValues, finalAttributes)
            resolve(response)
          })
          .catch(error => {
            reject(error)
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
     * @param {string}  parameters.parentUuid, window to search record data
     * @param {string}  parameters.containerUuid, tab to search record data
     * @param {boolean} parameters.clearSelection, clear selection after search
     */
    getDataListTab({ commit, dispatch, rootGetters }, parameters) {
      return new Promise((resolve, reject) => {
        var tab = rootGetters.getTab(parameters.parentUuid, parameters.containerUuid)
        var parsedQuery = parseContext({
          parentUuid: parameters.containerUuid,
          containerUuid: parameters.containerUuid,
          value: tab.query
        })

        var parsedWhereClause
        if (!isEmptyValue(tab.whereClause)) {
          parsedWhereClause = parseContext({
            parentUuid: parameters.containerUuid,
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
