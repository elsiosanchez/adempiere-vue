import { runProcess } from '@/api/ADempiere/data'

const processControl = {
  state: {
    process: []
  },
  mutations: {
    addStartedProcess(state, payload) {
      state.process.push(payload)
    },
    dataResetCacheProcess(state, payload) {
      state.process = payload
    }
  },
  actions: {
    // Supported Actions for it
    startProcess({ commit }, payload) {
      var processToRun = {
        uuid: payload.action.uuid
      }
      console.log(payload)
      commit('addStartedProcess', processToRun)
      // Run process on server and wait for it for notify
      runProcess(processToRun)
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
      console.log('TODO: Run here a server process: ' + payload.containerUuid)
    }
  },
  getters: {
    getRunningProcess: (state) => (processUuid) => {
      var process = state.process.find(
        item => item.uuid === processUuid
      )
      return process
    }
  }
}

export default processControl
