import Vue from 'vue'
// Delete when get global context and account context
import { contextInitialObject } from '@/utils/ADempiere/dataEmulation.js'

const context = {
  state: {
    context: contextInitialObject()
  },
  mutations: {
    setContext(state, payload) {
      var key = ''
      if (payload.parentUuid) {
        key += payload.parentUuid + '|'
      }
      if (payload.containerUuid) {
        key += payload.containerUuid + '|'
      }
      key += payload.columnName
      // set property to object
      Vue.set(state.context, key, payload.value)
    },
    setInitialContext(state, objectContext) {
      state.context = contextInitialObject()
      Object.keys(objectContext).forEach(key => {
        Vue.set(state.context, key, objectContext[key])
      })
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
    },
    setInitialContext: ({ commit }, otherContext = {}) => {
      commit('setInitialContext', otherContext)
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
      var key = ''
      if (findedContext.parentUuid) {
        key += findedContext.parentUuid + '|'
      }
      if (findedContext.containerUuid) {
        key += findedContext.containerUuid + '|'
      }
      key += findedContext.columnName

      return state.context[key]
    },
    getContextAll: (state) => {
      state.context
    }
  }
}

export default context
