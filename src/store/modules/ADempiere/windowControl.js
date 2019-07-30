import { createEntity, updateEntity, deleteEntity } from '@/api/ADempiere'
import { parseContext } from '@/utils/ADempiere'

const windowControl = {
  actions: {
    createNewEntity({ commit, dispatch, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        var panel = rootGetters.getPanel(params.containerUuid)
        // delete key from attributes
        var finalAttributes = rootGetters.getFilledColumnNamesAndValues(params.containerUuid)
        createEntity({
          tableName: panel.tableName,
          attributesList: finalAttributes
        })
          .then(response => {
            console.log('new record sucess', response)
            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    updateCurrentEntity({ commit, dispatch, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        // attributes or fields
        var finalAttributes = rootGetters.getParamsProcessToServer(params.containerUuid)
        if ((finalAttributes.fieldsMandatory.length > 0 &&
          finalAttributes.params.length >= finalAttributes.fieldsMandatory.length) ||
          finalAttributes.fieldsMandatory.length === 0) {
          updateEntity({
            tableName: params.tableName,
            uuid: params.recordUuid,
            attributesList: finalAttributes
          })
            .then(response => {
              console.info('edit entity sucess', response)
              resolve(response)
            })
            .catch(error => {
              reject(error)
            })
        }
      })
    },

    deleteEntity({ commit, dispatch, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        var panel = rootGetters.getPanel(params.containerUuid)
        var objectToDelete = {
          tableName: panel.tableName,
          recordUuid: params.recordUuid
        }

        deleteEntity(objectToDelete)
          .then(response => {
            console.log('delete entity sucess', response)
            resolve(response)
          })
          .catch(error => {
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
