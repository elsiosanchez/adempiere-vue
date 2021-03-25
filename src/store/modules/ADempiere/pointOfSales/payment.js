
import mutations from '@/store/ADempiere/mutations/pointOfSales/payments.js'
import actions from '@/store/ADempiere/actions/pointOfSales/payments.js'
import getters from '@/store/ADempiere/getters/pointOfSales/payments.js'
import state from '@/store/ADempiere/state/pointOfSales/payments.js'

/**
 * Payments Vuex Module
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
const collection = {
  state,
  mutations,
  actions,
  getters
}

export default collection
