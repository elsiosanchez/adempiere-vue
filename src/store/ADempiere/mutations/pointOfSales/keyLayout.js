import Vue from 'vue'
/**
 * Pont Of Sales Mutations
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
export default {
  setKeyLayout(state, keyLayout) {
    Vue.set(state, 'keyLayout', keyLayout)
  },
  setIsReloadKeyLayout(state) {
    Vue.set(state.keyLayout, 'isReload', true)
    Vue.set(state.keyLayout, 'isLoaded', false)
  }
}
