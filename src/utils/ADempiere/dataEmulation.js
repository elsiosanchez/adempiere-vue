import { clientDateTime } from '@/utils/ADempiere/valueUtil.js'

export function contextInitial() {
  var contex = new Map()
  contex.set('#AD_Client_ID', 0)
  contex.set('#AD_Language', 'en_US')
  contex.set('#AD_Org_ID', 0)
  contex.set('#AD_User_ID', 1)
  contex.set('#Date', clientDateTime())
  return contex
}
