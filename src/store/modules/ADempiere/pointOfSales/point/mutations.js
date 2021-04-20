import Vue from 'vue'

/**
 * Pos Mutations
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
export default {
  setPontOfSales(state, pos) {
    state.pointOfSales = pos
  },
  setCurrentPOS(state, pos) {
    Vue.set(state.pointOfSales, 'currentPOS', pos)
  },
  listPointOfSales(state, listPointOfSales) {
    state.listPointOfSales = listPointOfSales
  },
  currentPointOfSales(state, currentPointOfSales) {
    state.currentPointOfSales = currentPointOfSales
  }
}
