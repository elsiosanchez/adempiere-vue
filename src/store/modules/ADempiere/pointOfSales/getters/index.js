/**
 * PointOfSales Getters
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */

export default {
  /**
   * List PointOfSales
   * Current PointOfSales
   * Current Order
   * Line Order
   * List Payment
   * List Order
   */
  posAttributes: (state, getters) => {
    return {
      listPointOfSales: state.listPointOfSales,
      currentPointOfSales: {
        ...state.currentPointOfSales,
        listOrder: getters.getListOrder,
        currentOrder: {
          ...getters.getOrder,
          lineOrder: getters.getListOrderLine,
          listPayments: getters.getListPayments,
          isProcessed: getters.getIsProcessed
        }
      }
    }
  }
}
