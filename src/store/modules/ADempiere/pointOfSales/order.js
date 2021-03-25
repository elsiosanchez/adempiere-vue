
import mutations from '@/store/ADempiere/mutations/pointOfSales/order.js'
import actions from '@/store/ADempiere/actions/pointOfSales/order.js'
import getters from '@/store/ADempiere/getters/pointOfSales/order.js'
import state from '@/store/ADempiere/state/pointOfSales/order.js'

/**
 * Order Vuex Module
 * Create Order
 * Update Order
 * List Order
 * Delete Order
 * Reload Order
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
const ordes = {
  state,
  mutations,
  actions,
  getters
}

export default ordes
