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
  // return connectionDataRecord.requestObject(table, uuid)
}

export function getCriteria(table) {
  return Instance.call(this).getCriteria(table)
  // return connectionDataRecord.getCriteria(table)
}

export function getObjectListFromCriteria(table, criteria) {
  const criteriaForList = Instance.call(this).getCriteria(table)
  // const criteriaForList = connectionDataRecord.getCriteria(table)
  criteriaForList.setWhereclause(criteria)
  return Instance.call(this).requestObjectListFromCriteria(criteriaForList)
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
  //  Run Process
  return Instance.call(this).requestProcess(processRequest)
}
