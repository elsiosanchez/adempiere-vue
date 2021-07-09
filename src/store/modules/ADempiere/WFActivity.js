import {
  listActivity
} from '@/api/ADempiere/form/wf-activity.js'
import { showMessage } from '@/utils/ADempiere/notification.js'

const activity = {
  listActivity: [],
  currentActivity: {}
}

export default {
  state: activity,
  mutations: {
    setActivity(state, activity) {
      state.listActivity = activity
    },
    setCurrentActivity(state, activity) {
      state.currentActivity = activity
    }
  },
  actions: {
    serverListActivity({ commit }, {
      formUuid
    }) {
      listActivity({
        formUuid
      })
        .then(listActivityResponse => {
          commit('setActivity', listActivityResponse)
        })
        .catch(error => {
          console.warn(`serverListActivity: ${error.message}. Code: ${error.code}.`)
          showMessage({
            type: 'error',
            message: error.message,
            showClose: true
          })
        })
    },
    selectedActivity({ commit }, activity) {
      commit('setCurrentActivity', activity)
    }
  },
  getters: {
    getCurrentActivity: (state) => {
      return state.currentActivity
    },
    getActivity: (state) => {
      return state.listActivity
    }
  }
}
