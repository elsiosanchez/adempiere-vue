
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

export default utils
