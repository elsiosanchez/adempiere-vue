
const context = {
  state: {
    context: {
      account: {},
      containers: new Map(),
      global: {
        lang: 'en_US',
        Login: {
          RememberMe: null
        },
        UI: 'Vue.js'
      }
    }
  },
  mutations: {
    setContext(state, payload) {
      var parent = ''
      var container = ''
      if (typeof payload.parentUuid !== 'undefined') {
        parent = payload.parentUuid + '|'
      }
      if (typeof payload.containerUuid !== 'undefined') {
        container = payload.containerUuid + '|'
      }
      state.context.containers.set(
        parent + container + payload.columnName,
        payload.value
      )
    }
  },
  actions: {
    setContext: ({ commit }, objectValue) => {
      commit('setContext', objectValue)
    }
  },
  getters: {
    getContext: (state) => (findedContext) => {
      var parent = ''
      var container = ''
      if (typeof findedContext.parentUuid !== 'undefined' && findedContext.parentUuid !== null) {
        parent = findedContext.parentUuid + '|'
      }
      if (typeof findedContext.containerUuid !== 'undefined' && findedContext.parentUuid !== null) {
        container = findedContext.containerUuid + '|'
      }
      var key = parent + container + findedContext.columnName
      return state.context.containers.get(key)
    }
  }
}

export default context
