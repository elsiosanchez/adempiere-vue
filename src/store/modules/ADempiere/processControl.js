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
    getRunningProcess: (state, rootGetters) => (processUuid) => {
      var processList = state.process.map((item) => {
        var process = rootGetters.getProcess(item.uuid)
        if (typeof process !== undefined) {
          return process
        }
      })
      return processList
    }
  }
}

export default processControl
