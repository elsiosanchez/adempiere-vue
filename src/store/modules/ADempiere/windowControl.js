import { createEntity, updateEntity, deleteEntity } from '@/api/ADempiere'
import { convertValuesMapToObject, isEmptyValue, parseContext } from '@/utils/ADempiere'

const windowControl = {
  actions: {
    resetPanelToNew({ dispatch, rootGetters }, params) {
      var defaultAttributes = rootGetters.getColumnNamesAndValues(params.containerUuid, 'parsedDefaultValue', true)
      console.log(defaultAttributes)
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
            dispatch('notifyPanelChange', {
              containerUuid: params.containerUuid,
              newValues: newValues,
              isDontSendToEdit: true
            })
            console.info('new record sucess', result, finalAttributes)
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
            console.info('delete entity sucess', response)
            resolve(response)
          })
          .catch(error => {
            console.warn('Delete Entity - Error ', error.message, ', Code:', error.code)
            reject(error)
          })
      })
    },
    /**
     *
     * @param {string} params.parentUuid, window to search record data
     * @param {string} params.containerUuid, tab to search record data
     * @param {boolean} params.clearSelection, clear selection after search
     */
    getDataListTab({ commit, dispatch, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        var tab = rootGetters.getTab(params.parentUuid, params.containerUuid)
        var parsedQuery = parseContext({
          parentUuid: params.containerUuid,
          containerUuid: params.containerUuid,
          value: tab.query
        })

        var parsedWhereClause
        if (!isEmptyValue(tab.whereClause)) {
          parsedWhereClause = parseContext({
            parentUuid: params.containerUuid,
            containerUuid: params.containerUuid,
            value: tab.whereClause
          })
        }
        dispatch('getObjectListFromCriteria', {
          parentUuid: params.parentUuid,
          containerUuid: params.containerUuid,
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
