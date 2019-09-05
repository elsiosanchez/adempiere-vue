
const utils = {
  state: {
    width: 0,
    height: 0,
    splitHeight: 160
  },
  mutations: {
    setWidth(state, width) {
      state.width = width
    },
    setHeigth(state, height) {
      state.height = height
    },
    setSplitHeight(state, splitHeight) {
      state.splitHeight = splitHeight
    }
  },
  actions: {
    setWidth({ commit }, width) {
      commit('setWidth', width)
    },
    setHeight({ commit }, height) {
      commit('setHeigth', height)
    },
    setSplitHeight({ commit }, splitHeight) {
      commit('setSplitHeight', splitHeight)
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
    getWidth: (state) => {
      return state.width
    },
    getWidthLayout: (state, rootGetters) => {
      if (rootGetters.toggleSideBar) {
        return state.width - 250
      }
      return state.width - 54
    },
    getHeigth: (state) => {
      return state.height
    },
    getSplitHeight: (state) => {
      const split = state.splitHeight
      var panelHeight = 0
      if (split !== 160) {
        panelHeight = split.splitHeight
      } else {
        panelHeight = split
      }
      return panelHeight
    }
  }
}
// heigth window
export default utils
