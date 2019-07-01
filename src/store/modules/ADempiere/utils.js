
const utils = {
  state: {
    width: 0,
    height: 0
  },
  mutations: {
    setWidth(state, width) {
      state.width = width
    },
    setHeigth(state, height) {
      state.height = height
    }
  },
  actions: {
    setWidth({ commit }, width) {
      commit('setWidth', width)
    },
    setHeight({ commit }, height) {
      commit('setHeigth', height)
    },
    changeShowedDetail({ dispatch }, params) {
      if (params.panelType === 'window') {
        dispatch('changeShowedDetailWindow', params)
      } else if (params.panelType === 'browser') {
        dispatch('changeShowedCriteriaBrowser', params)
      }
    }
  },
  getters: {
    getWidth: (state) => () => {
      return state.width
    },
    getHeigth: (state) => () => {
      return state.height
    }
  }
}
// heigth window
export default utils
