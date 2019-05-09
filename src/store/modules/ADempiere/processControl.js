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
    },
    deleteProcess(state, payload) {
      state.process = payload
    }
  },
  actions: {
    // Supported Actions for it
    startProcess({ commit }, objectParams) {
      var processToRun = {
        uuid: objectParams.containerUuid
      }
      commit('addStartedProcess', objectParams.containerUuid)
      // Run process on server and wait for it for notify
      runProcess(processToRun)

      console.log('TODO: Run here a server process: ' + objectParams.containerUuid)
    },
    deleteProcess({ commit, state }, uuid) {
      var processList = state.process.filter((item) => {
        if (item !== uuid) {
          return true
        }
      })
      commit('deleteProcess', processList)
    }
  },
  getters: {
    getRunningProcess: (state, rootGetters, rootState) => {
      var processList = []

      state.process.map((item) => {
        var itemProcess = rootGetters.getProcess(item)
        if (typeof itemProcess !== undefined) {
          processList.push(itemProcess)
        }
      })
      return processList
      // return process = state.process.find(
      //   item => item.uuid === processUuid
      // )
    }
  }
}

export default processControl
