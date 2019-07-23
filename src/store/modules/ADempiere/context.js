// Delete when get global context and account context
import { contextInitial } from '@/utils/ADempiere/dataEmulation.js'

const context = {
  state: {
    context: {
      account: {},
      // containers: new Map(),
      containers: contextInitial(),
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
      if (payload.parentUuid !== undefined) {
        parent = payload.parentUuid + '|'
      }
      if (payload.containerUuid !== undefined) {
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
    /**
     * @param  {object} findedContext
     *  - parentUuid
     *  - containerUuid
     *  - columnName
     */
    getContext: (state) => (findedContext) => {
      var parent = ''
      var container = ''
      if (findedContext.parentUuid !== undefined && findedContext.parentUuid !== null) {
        parent = findedContext.parentUuid + '|'
      }
      if (findedContext.containerUuid !== undefined && findedContext.parentUuid !== null) {
        container = findedContext.containerUuid + '|'
      }
      var key = parent + container + findedContext.columnName
      return state.context.containers.get(key)
    }
  }
}

export default context
