import { getLanguage } from '@/lang/index'
import { getToken } from '@/utils/auth'
import BusinessData from '@adempiere/grpc-data-client'
import { HOST_GRPC_DATA } from '@/api/ADempiere/constants'
import { showMessage } from '@/utils/ADempiere/notification'

// Get Instance for connection
function Instance() {
  return new BusinessData(
    HOST_GRPC_DATA,
    getToken(),
    getLanguage() || 'en_US'
  )
}

export function getObject(table, uuid = false, id = false) {
  return Instance.call(this).getEntity(
    Instance.call(this).getEntityRequest(table, uuid, id)
  )
}

/**
 * Create entity
 * @param {string}  parameters.tableName
 * @param {array}   parameters.attributesList
 */
export function createEntity(parameters) {
  var entityRequest = Instance.call(this).getCreateEntityRequest()
  entityRequest.setTablename(parameters.tableName)
  if (parameters.attributesList && parameters.attributesList.length > 0) {
    parameters.attributesList.forEach(attribute => {
      const convertedAttribute = Instance.call(this).convertParameter(attribute)
      entityRequest.addAttributes(convertedAttribute)
    })
  }
  //  Create Entity
  return Instance.call(this).createEntity(entityRequest)
}

/**
 * Update entity
 * @param {string}  parameters.tableName
 * @param {integer} parameters.recordId
 * @param {string}  parameters.recordUuid
 * @param {array}   parameters.attributesList
 */
export function updateEntity(parameters) {
  var entityRequest = Instance.call(this).getUpdateEntityRequest()
  entityRequest.setTablename(parameters.tableName)
  if (parameters.recordId) {
    entityRequest.setRecordid(parameters.recordId)
  }
  entityRequest.setUuid(parameters.recordUuid)
  if (parameters.attributesList && parameters.attributesList.length > 0) {
    parameters.attributesList.forEach(attribute => {
      const convertedAttribute = Instance.call(this).convertParameter(attribute)
      entityRequest.addAttributes(convertedAttribute)
    })
  }
  //  Update Entity
  return Instance.call(this).updateEntity(entityRequest)
}

/**
 * Delete entity
 * @param {string}  parameters.tableName
 * @param {integer} parameters.recordId
 * @param {string}  parameters.recordUuid
 * @param {array}   parameters.attributesList
 */
export function deleteEntity(parameters) {
  var entityRequest = Instance.call(this).getUpdateEntityRequest()
  entityRequest.setTablename(parameters.tableName)
  if (parameters.recordId) {
    entityRequest.setRecordid(parameters.recordId)
  }
  entityRequest.setUuid(parameters.recordUuid)

  //  Delete Entity
  return Instance.call(this).deleteEntity(entityRequest)
}

export function getCriteria(tableName) {
  return Instance.call(this).getCriteria(tableName)
}

/**
 * Object List from window
 * @param {string} object.tableName
 * @param {string} object.query
 * @param {string} object.whereClause
 * @param {string} object.orderByClause
 */
export function getObjectListFromCriteria(object) {
  const criteriaForList = getCriteria(object.tableName)

  if (object.query) {
    criteriaForList.setQuery(object.query)
  }
  if (object.whereClause) {
    criteriaForList.setWhereclause(object.whereClause)
  }
  if (object.orderByClause) {
    criteriaForList.setOrderbyclause(object.orderByClause)
  }
  var nextPageToken
  if (object.nextPageToken) {
    nextPageToken = object.nextPageToken
  }
  return Instance.call(this).requestObjectListFromCriteria(criteriaForList, nextPageToken)
}

/**
 * Request a Lookup list data from Reference
 * The main attributes that function hope are:
 * @param {string} reference.tableName
 * @param {string} reference.parsedQuery
 */
export function getLookupList(reference) {
  return Instance.call(this).requestLookupListFromReference(reference)
}

/**
 * Request a Lookup data from Reference
 * The main attributes that function hope are:
 * @param {string} reference.tableName
 * @param {string} reference.parsedQuery
 * @param {string|number} value
 */
export function getLookup(reference, value) {
  return Instance.call(this).requestLookupFromReference(reference, value)
}

/**
 * Request a process
 * This function allows follow structure:
 * @param {object}  process
 * @param {string}  process.uuid, uuid from process to run
 * @param {integer} process.tableName, table name of tab, used only window
 * @param {integer} process.recordId, record identifier, used only window
 * @param {array}   process.parameters, parameters from process
      [ { columnName, value } ]
 * @param {array}   process.selection, selection records, used only browser
      [ {
          selectionId,
          selectionValues [
            { columnName, value }
          ]
      } ]
 */
export function runProcess(process) {
  var processRequest = Instance.call(this).getProcessRequest()
  //  Fill Request process
  processRequest.setUuid(process.uuid)

  // record in window
  if (process.tableName) {
    processRequest.setTablename(process.tableName)
  }
  if (process.recordId) {
    processRequest.setRecordid(process.recordId)
  }

  // browser selection list records
  if (process.selection && process.selection.length > 0) {
    process.selection.forEach(record => {
      // selection format = { selectionId: integer, selectionValues: array }
      const convertedRecord = Instance.call(this).convertSelection(record)
      processRequest.addSelections(convertedRecord)
    })
  }

  // report export type
  processRequest.setReportexporttype(process.reportExportType)

  // process params
  if (process.parameters && process.parameters.length > 0) {
    process.parameters.forEach(parameter => {
      const convertedParameter = Instance.call(this).convertParameter(parameter)
      processRequest.addParameters(convertedParameter)
    })
  }

  //  Run Process
  return Instance.call(this).requestProcess(processRequest)
}

/**
 * Request a browser search
 * This function allows follow structure:
 * @param {string} browser.uuid
 * @param {string} browser.query
 * @param {string} browser.whereClause
 * @param {string} browser.orderByClause
 * @param {array}  browser.parameters
 * [
 *   {
 *     columnName,
 *     value
 *   }
 * ]
 */
export function getBrowserSearch(browser) {
  showMessage({
    title: 'Loading...',
    message: 'Searching records in server',
    type: 'info'
  })
  var browserRequest = Instance.call(this).getBrowserRequest()
  var criteria = Instance.call(this).getCriteria('')
  //  Fill Request browser
  browserRequest.setUuid(browser.uuid)
  criteria.setQuery(browser.query)
  criteria.setWhereclause(browser.whereClause)
  criteria.setOrderbyclause(browser.orderByClause)

  if (browser.nextPageToken) {
    browserRequest.setPageToken(browser.nextPageToken)
  }
  browserRequest.setCriteria(criteria)
  /* isQueryCriteria fields parameters */
  if (browser.parameters !== undefined) {
    browser.parameters.forEach(parameter => {
      const convertedParameter = Instance.call(this).convertParameter(parameter)
      browserRequest.addParameters(convertedParameter)
    })
  }
  //  Run browser
  return Instance.call(this).requestBrowser(browserRequest)
}

// Request a Process Activity list
export function requestProcessActivity() {
  //  Get Process Activity
  return Instance.call(this).requestProcessActivity()
}

export function getRecentItems() {
  return Instance.call(this).requestRecentItems()
}

/**
 * Reference List from Window
 * @param {string}  parameters.tableName
 * @param {string}  parameters.windowUuid
 * @param {string}  parameters.recordUuid
 * @param {integer} parameters.recordId
 */
export function getReferencesList(parameters) {
  var requestReference = Instance.call(this).getReferencesRequest()
  requestReference.setWindowuuid(parameters.windowUuid)
  requestReference.setTablename(parameters.tableName)
  requestReference.setUuid(parameters.recordUuid)
  if (parameters.recordId) {
    requestReference.setRecordid(parameters.recordId)
  }

  return Instance.call(this).listReferencesRequest(requestReference)
}
