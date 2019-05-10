import { runProcess } from '@/api/ADempiere/data'

const processControl = {
  state: {
    visibleDialog: false,
    metadata: {},
    process: []
  },
  mutations: {
    addStartedProcess(state, payload) {
      console.log(payload)
      state.process.push(payload)
    },
    dataResetCacheProcess(state, payload) {
      state.process = payload
    },
    setShowDialog(state, payload) {
      state.visibleDialog = true
      state.metadata = payload
    },
    setCloseDialog(state, payload) {
      state.visibleDialog = false
      state.metadata = payload
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
    setShowDialog({ commit }, process) {
      if (typeof process === 'undefined') {
        commit('setCloseDialog')
      } else {
        commit('setShowDialog', process)
      }
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
