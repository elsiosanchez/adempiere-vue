import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
/**
 * Pont Of Sales Getters
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
const withoutResponse = {
  isLoaded: false,
  isReload: true,
  recordCount: 0,
  nextPageToken: undefined
}

export default {
  getKeyLayoutUuidWithPOS: (state, getters) => {
    const currentPOS = getters.getCurrentPOS
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
