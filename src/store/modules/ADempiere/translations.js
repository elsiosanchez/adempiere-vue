import { getObjectListFromCriteria } from '@/api/ADempiere/data'
import { convertValueFromGRPC } from '@/utils/ADempiere'

const translations = {
  state: {
    messages: []
  },
  mutations: {
    setMessages(state, payload) {
      state.messages = payload
    }
  },
  actions: {
    getMessagesFromServer: ({ commit }, params) => {
      return new Promise((resolve, reject) => {
        getObjectListFromCriteria(params.table, params.criteria)
          .then(response => {
            var messagesList = response.getRecordsList()
            var messages = messagesList.map(itemRecord => {
              const map = itemRecord.getValuesMap()
              var values = {}
              values[convertValueFromGRPC(map.get('Value'))] = convertValueFromGRPC(map.get('MsgText'))
              return values
            })
            commit('setMessages', messages)
            resolve(messages)
          })
          .catch(error => {
            console.log('Error ' + error.code + ' getting messages from server ' + error.message)
            reject(error)
          })
      })
    }
  },
  getters: {
    getMessages: (state) => {
      return state.messages
    }
  }
}

export default translations
