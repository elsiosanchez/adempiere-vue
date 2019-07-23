import { getLanguage } from '@/lang/index'
import { getToken } from '@/utils/auth'
import BusinessData from '@adempiere/grpc-data-client'
import { HOST_GRPC_DATA } from './constants'
import { showMessage } from '@/utils/ADempiere/notification'

// Get Instance for connection
function Instance() {
  return new BusinessData(
    HOST_GRPC_DATA,
    getToken(),
    getLanguage() || 'en_US'
  )
}

export function getObject(table, uuid = false) {
  return Instance.call(this).getEntity(Instance.call(this).getEntityRequest(table, uuid))
}

export function getCriteria(tableName) {
  return Instance.call(this).getCriteria(tableName)
}

/**
 *
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

  return Instance.call(this).requestObjectListFromCriteria(criteriaForList)
}

// Request a Lookup list data from Reference
// The main attributes that function hope are:
// reference {
//   tableName,
//   parsedQuery
// }
export function getLookupList(reference) {
  return Instance.call(this).requestLookupListFromReference(reference)
}

// Request a Lookup data from Reference
// The main attributes that function hope are:
// reference {
//   tableName,
//   parsedDirectQuery
// }
export function getLookup(reference, value) {
  return Instance.call(this).requestLookupFromReference(reference, value)
}

// Request a process
// This function allows follow structure:
// process.uuid
// process.tableId
// process.recordId
// process.tableSelectedId
// process.parameters [
//   {
//     columnName,
//     value
//   }
// ]
// process.selection [
//   {
//     selectionId,
//     selectionValues [
//       {
//         columnName,
//         value
//       }
//   }]
// ]
export function runProcess(process) {
  var processRequest = Instance.call(this).getProcessRequest()
  //  Fill Request process
  processRequest.setUuid(process.uuid)
  processRequest.setTableid(process.tableId)
  processRequest.setRecordid(process.recordId)
  processRequest.setTableselectedid(process.tableSelectedId)
  processRequest.setReportexporttype(process.reportExportType)
  if (process.parameters !== undefined && process.parameters.length > 0) {
    process.parameters.forEach(parameter => {
      const convertedParameter = Instance.call(this).convertParameter(parameter)
      processRequest.addParameters(convertedParameter)
    })
  }

  if (process.selection !== undefined && process.selection.length > 0) {
    process.selection.forEach(record => {
      const convertedRecord = Instance.call(this).convertSelection(record)
      processRequest.addSelections(convertedRecord)
    })
  }

  //  Run Process
  return Instance.call(this).requestProcess(processRequest)
}

// Request a browser search
// This function allows follow structure:
// browser.uuid
// browser.query
// browser.whereClause
// browser.orderByClause
// browser.parameters [
//   {
//     columnName,
//     value
//   }
// ]
export function getBrowserSearch(browser) {
  var notificationParams = {
    title: 'Loading...',
    message: 'Searching records in server',
    type: 'info'
  }
  showMessage(notificationParams)
  var browserRequest = Instance.call(this).getBrowserRequest()
  var criteria = Instance.call(this).getCriteria('')
  //  Fill Request browser
  browserRequest.setUuid(browser.uuid)
  criteria.setQuery(browser.query)
  criteria.setWhereclause(browser.whereClause)
  criteria.setOrderbyclause(browser.orderByClause)
  browserRequest.setCriteria(criteria)
  /* isQueryCriteria fields parameters */
  if (browser.parameters !== undefined) {
    browser.parameters.forEach(parameter => {
      const convertedParameter = Instance.call(this).convertParameter(parameter)
      browserRequest.addParameters(convertedParameter)
    })
  }
  // browserRequest.setParametersList(convertParameter())
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
