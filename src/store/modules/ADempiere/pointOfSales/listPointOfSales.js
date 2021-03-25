
import mutations from '@/store/ADempiere/mutations/pointOfSales/index.js'
import actions from '@/store/ADempiere/actions/pointOfSales/index.js'
import getters from '@/store/ADempiere/getters/pointOfSales/index.js'
import state from '@/store/ADempiere/state/pointOfSales/index.js'

/**
 * Order Vuex Module
 * Create Order
 * Update Order
 * List Order
 * Delete Order
 * Reload Order
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
const ListPointOfSales = {
  state,
  mutations,
  actions,
  getters
}

export default ListPointOfSales
