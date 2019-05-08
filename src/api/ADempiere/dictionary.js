import Cookies from 'js-cookie'
import { getToken } from '@/utils/auth'
import Dictionary from '@adempiere/grpc-dictionary-client'
import { HOST_GRPC_DICTIONARY } from './constants'

// Get Instance for connection
function Instance() {
  return new Dictionary(
    HOST_GRPC_DICTIONARY,
    getToken(),
    Cookies.get('lang') || 'en_US'
  )
}

export function getWindow(uuid, childrenTabs = true) {
  return Instance.call(this).requestWindow(uuid, childrenTabs)
}

export function getProcess(uuid, childrenFields = false) {
  return Instance.call(this).requestProcess(uuid, childrenFields)
}

export function getBrowser(uuid, childrenFields = false) {
  return Instance.call(this).requestBrowser(uuid, childrenFields)
}

export function getReport(uuid, childrenFields = false) {
  return Instance.call(this).requestReport(uuid, childrenFields)
}

export function getTab(uuid, childrenFields = true) {
  return Instance.call(this).requestTab(uuid, childrenFields)
}

export function getField(uuid) {
  return Instance.call(this).requestField(uuid)
}
