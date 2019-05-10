import { runProcess, getLookupList } from '@/api/ADempiere/data'

const processControl = {
  state: {
    visibleDialog: false,
    metadata: {},
    process: []
  },
  mutations: {
    addStartedProcess(state, payload) {
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
        uuid: payload.action.uuid,
        name: payload.action.name,
        description: payload.action.description,
        help: payload.action.help,
        isReport: payload.action.isReport,
        accessLevel: payload.accessLevel,
        showHelp: payload.action.showHelp,
        isDirectPrint: payload.action.isDirectPrint,
        reportExportType: payload.action.reportExportType
      }
      commit('addStartedProcess', processToRun)
      getLookupList({
        tableName: 'M_DiscountSchema',
        parsedQuery: "SELECT M_DiscountSchema.M_DiscountSchema_ID,NULL,NVL(M_DiscountSchema.Name,'-1'),M_DiscountSchema.IsActive FROM M_DiscountSchema WHERE M_DiscountSchema.DiscountType<>'P' ORDER BY 3"
      })
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
      // Run process on server and wait for it for notify
      runProcess(processToRun)
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
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
