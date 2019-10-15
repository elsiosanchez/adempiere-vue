import Vue from 'vue'
// Delete when get global context and account context
import { contextInitialObject } from '@/utils/ADempiere/dataEmulation.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtil.js'

const context = {
  state: {
    context: contextInitialObject()
  },
  mutations: {
    setContext(state, payload) {
      var key = ''
      if (payload.parentUuid && !isEmptyValue(payload.value)) {
        key += payload.parentUuid + '|'

        // set context for window
        const keyParent = key + payload.columnName
        Vue.set(state.context, keyParent, payload.value)
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
    getContext: (state) => ({ parentUuid, containerUuid, columnName }) => {
      var key = ''

      if (parentUuid) {
        key += parentUuid + '|'

        // context for window
        const keyParent = key + columnName
        const valueParent = state.context[keyParent]
        if (!isEmptyValue(valueParent)) {
          return valueParent
        }
      }
      if (containerUuid) {
        key += containerUuid + '|'
      }
      key += columnName

      return state.context[key]
    },
    getContextAll: (state) => {
      state.context
    }
  }
}

export default context
