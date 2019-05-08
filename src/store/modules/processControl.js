import { runProcess } from '@/api/ADempiere/data'

const processControl = {
  state: {
    process: [],
    processExecution: []
  },
  mutations: {
    addStartedProcess(state, payload) {
      state.process.push(payload)
    },
    dataResetCacheProcess(state, payload) {
      state.process = payload
    },
    addProcessExecution(state, payload) {
      state.processExecution.push(payload)
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
    },
    addProcessExecution: ({ commit }, objectParams) => {
      commit('addProcessExecution', objectParams)
    }
  },

  getters: {
    getRunningProcess: (state) => (processUuid) => {
      var process = state.process.find(
        item => item.uuid === processUuid
      )
      return process
    },
    getProcessExecution: (state, rootGetters, rootState) => {
      var processList = []
      state.processExecution.map((item) => {
        var itemProcess = rootGetters.getProcess(item)
        if (typeof itemProcess !== undefined) {
          processList.push(itemProcess)
        }
      })
      return processList
    }
  }
}

export default processControl
