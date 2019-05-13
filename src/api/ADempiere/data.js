import Cookies from 'js-cookie'
import { getToken } from '@/utils/auth'
import DataRecord from '@adempiere/grpc-data-client'
import { HOST_GRPC_DATA } from './constants'

// Get Instance for connection
function Instance() {
  return new DataRecord(
    HOST_GRPC_DATA,
    getToken(),
    Cookies.get('lang') || 'en_US'
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
export function getLookup(reference) {
  return Instance.call(this).requestLookupFromReference(reference)
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
  //  Run Process
  console.log(Instance.call(this).requestProcess(processRequest))
  return Instance.call(this).requestProcess(processRequest)
}
