/**
 * PointOfSales Getters
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */

export default {
  getIsShowPOSOptions: (state) => {
    return state.showPOSOptions
  },
  getShowPOSKeyLayout: (state) => {
    return state.showPOSKeyLayout
  },
  getShowCollectionPos: (state) => {
    return state.showPOSCollection
  }
}
