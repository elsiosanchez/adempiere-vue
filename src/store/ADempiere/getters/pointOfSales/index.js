/**
 * Pont Of Sales Getters
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */

import { isEmptyValue } from '@/utils/ADempiere'

export default {
  getListPointOfSales: (state) => {
    return state.listPointOfSales
  },
  CurrentPointOfSales: (state, getters) => {
    const userUuid = getters['user/getUserUuid']
    const listPointOfSales = getters.getListPointOfSales
    if (isEmptyValue(listPointOfSales)) {
      return undefined
    }
    const currentPoint = listPointOfSales.find(pos => pos.uuid === userUuid)
    if (!isEmptyValue(currentPoint)) {
      return currentPoint
    }
    return listPointOfSales[0]
  }
}
