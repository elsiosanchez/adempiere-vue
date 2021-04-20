/**
 * PointOfSales Getters
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

const withoutResponse = {
  isLoaded: false,
  isReload: true,
  recordCount: 0,
  nextPageToken: undefined
}

export default {
  getKeyLayoutUuidWithPOS: (state, getters) => {
    const currentPOS = getters.posAttributes.currentPointOfSales
    if (isEmptyValue(currentPOS)) {
      return undefined
    }
    return currentPOS.keyLayoutUuid
  },
  getKeyLayout: (state) => {
    if (isEmptyValue(state.keyLayout)) {
      return {
        ...withoutResponse,
        uuid: undefined,
        ordersList: []
      }
    }
    return state.keyLayout
  }
}
