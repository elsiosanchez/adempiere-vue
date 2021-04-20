/**
 * Pos State
 * @author Elsio Sanchez <elsiosanches@gmail.com>
 */
const withoutResponse = {
  isLoaded: false,
  isReload: true,
  recordCount: 0,
  nextPageToken: undefined
}
export default {
  pointOfSales: {
    ...withoutResponse
  },
  listPointOfSales: {},
  currentPointOfSales: {}
}
