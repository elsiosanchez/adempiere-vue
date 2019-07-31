import { createEntity, updateEntity, deleteEntity } from '@/api/ADempiere'
import { convertValue, parseContext } from '@/utils/ADempiere'

const windowControl = {
  actions: {
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
            var map = response.getValuesMap()
            var newValue = {}
            map.forEach((value, key) => {
              var valueResult = map.get(key)
              var tempValue = null
              if (valueResult) {
                tempValue = convertValue(value)
              }
              newValue[key] = tempValue
            })

            var result = {
              data: newValue,
              recordUuid: response.getUuid(),
              recordId: response.getId(),
              tableName: response.getTablename()
            }
            console.log('new record sucess', result)
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    updateCurrentEntity({ commit, dispatch, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        var panel = rootGetters.getPanel(params.containerUuid)
        // attributes or fields
        var finalAttributes = rootGetters.getColumnNamesAndValues(params.containerUuid)
        updateEntity({
          tableName: panel.tableName,
          uuid: params.recordUuid,
          attributesList: finalAttributes
        })
          .then(response => {
            var map = response.getValuesMap()
            var newValue = {}
            map.forEach((value, key) => {
              var valueResult = map.get(key)
              var tempValue = null
              if (valueResult) {
                tempValue = convertValue(value)
              }
              newValue[key] = tempValue
            })

            console.info('edit entity sucess', newValue)
            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    deleteEntity({ commit, dispatch, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        var panel = rootGetters.getPanel(params.containerUuid)
        var objectToDelete = {
          tableName: panel.tableName,
          recordUuid: panel.recordUuid
        }

        deleteEntity(objectToDelete)
          .then(response => {
            console.log('delete entity sucess', response)
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
        var parsedWhereClause = parseContext({
          parentUuid: params.containerUuid,
          containerUuid: params.containerUuid,
          value: tab.whereClause
        })

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
