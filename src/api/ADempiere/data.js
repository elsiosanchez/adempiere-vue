import { getLanguage } from '@/lang/index'
import { getToken } from '@/utils/auth'
import DataRecord from '@adempiere/grpc-data-client'
import { HOST_GRPC_DATA } from './constants'

// Get Instance for connection
function Instance() {
  return new DataRecord(
    HOST_GRPC_DATA,
    getToken(),
    getLanguage() || 'en_US'
  )
}

export function getObject(table, uuid = false) {
  return Instance.call(this).requestObject(table, uuid)
}

export function getCriteria(table) {
  return Instance.call(this).getCriteria(table)
}

export function getObjectListFromCriteria(table, criteria) {
  const criteriaForList = Instance.call(this).getCriteria(table)
  criteriaForList.setWhereclause(criteria)
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
  var processActivityRequest = Instance.call(this).getProcessActivityRequest()
  //  Get Process Activity
  return Instance.call(this).requestProcessActivity(processActivityRequest)
}
