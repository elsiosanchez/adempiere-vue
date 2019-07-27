import { createEntity, updateEntity, deleteEntity } from '@/api/ADempiere'
import { parseContext } from '@/utils/ADempiere'

const windowControl = {
  actions: {
    /**
     * Create entity
     * @param {integer} createEntityRequest.tableId
     * @param {array} createEntityRequest.attributesList
     */
    setNewEntity({ commit, dispatch, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        var finalAttributes = rootGetters.getParamsProcessToServer(params.containerUuid)
        if ((finalAttributes.fieldsMandatory.length > 0 &&
          finalAttributes.params.length >= finalAttributes.fieldsMandatory.length) ||
          finalAttributes.fieldsMandatory.length === 0) {
          createEntity({
            tableId: 0, // params.tableId,
            attributesList: finalAttributes
          })
            .then(response => {
              resolve(response)
            })
            .catch(error => {
              reject(error)
            })
        }
      })
    },
    /**
     * Create entity
     * @param {integer} createEntityRequest.tableId
     * @param {array} createEntityRequest.attributesList
     */
    editEntity({ commit, dispatch, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        var finalAttributes = rootGetters.getParamsProcessToServer(params.containerUuid)
        if ((finalAttributes.fieldsMandatory.length > 0 &&
          finalAttributes.params.length >= finalAttributes.fieldsMandatory.length) ||
          finalAttributes.fieldsMandatory.length === 0) {
          updateEntity({
            tableId: 0, // params.tableId,
            recordId: params.recordId,
            uuid: params.uuid,
            attributesList: finalAttributes
          })
            .then(response => {
              console.info('edit entity', response)
              resolve(response)
            })
            .catch(error => {
              reject(error)
            })
        }
      })
    },
    /**
     * Create entity
     * @param {integer} createEntityRequest.tableId
     * @param {array} createEntityRequest.attributesList
     */
    deleteEntity({ commit, dispatch, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        deleteEntity({
          tableId: 0, // params.tableId,
          recordId: params.recordId,
          uuid: params.uuid
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
