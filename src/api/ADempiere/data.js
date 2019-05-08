import Vue from 'vue'
import Cookies from 'js-cookie'
import { getToken } from '@/utils/auth'
import DataRecord from '@adempiere/grpc-data-client'
import { HOST_GRPC_DATA } from './constants'

// global instances in Vue from Record Data connection
Vue.prototype.$DataRecord = new DataRecord(
  HOST_GRPC_DATA,
  getToken(),
  Cookies.get('lang') || 'en_US'
)

export var connectionDataRecord = Vue.prototype.$DataRecord

export function getObject(table, uuid = false) {
  return connectionDataRecord.requestObject(table, uuid)
}

export function getCriteria(table) {
  return connectionDataRecord.getCriteria(table)
}

export function getObjectListFromCriteria(table, criteria) {
  const criteriaForList = connectionDataRecord.getCriteria(table)
  criteriaForList.setWhereclause(criteria)
  return connectionDataRecord.requestObjectListFromCriteria(criteriaForList)
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
  var processRequest = connectionDataRecord.getProcessRequest()
  //  Fill Request process
  processRequest.setUuid(process.uuid)
  processRequest.setTableid(process.tableId)
  processRequest.setRecordid(process.recordId)
  processRequest.setTableselectedid(process.tableSelectedId)
  //  Run Process
  return connectionDataRecord.requestProcess(processRequest)
}
