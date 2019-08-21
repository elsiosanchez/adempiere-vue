// Delete when get global context and account context
import { contextInitial } from '@/utils/ADempiere'

const context = {
  state: {
    context: contextInitial()
    // context: new Map()
  },
  mutations: {
    setContext(state, payload) {
      var parent = ''
      var container = ''
      if (payload.parentUuid) {
        parent = payload.parentUuid + '|'
      }
      if (payload.containerUuid) {
        container = payload.containerUuid + '|'
      }
      state.context.set(
        parent + container + payload.columnName,
        payload.value
      )
    }
  },
  actions: {
    setContext: ({ commit }, objectValue) => {
      commit('setContext', objectValue)
    },
    setMultipleContext: ({ commit }, valuesToSetter) => {
      valuesToSetter.forEach(itemToSetter => {
        commit('setContext', itemToSetter)
      })
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
      if (findedContext.parentUuid) {
        parent = findedContext.parentUuid + '|'
      }
      if (findedContext.containerUuid) {
        container = findedContext.containerUuid + '|'
      }
      var key = parent + container + findedContext.columnName
      return state.context.get(key)
    }
  }
}

export default context
