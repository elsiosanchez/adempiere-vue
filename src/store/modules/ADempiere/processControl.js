import { runProcess, getLookupList } from '@/api/ADempiere/data'

const processControl = {
  state: {
    visibleDialog: false,
    reportFormat: '',
    reportContent: ``,
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
    },
    openReport(state, payload) {
      // console.log('mutation - openReport', payload)
      state.reportFormat = payload.output.reportExportType
      state.reportContent = payload.output.output
    }
  },
  actions: {
    // Supported Actions for it
    startProcess({ commit, dispatch }, payload) {
      var processResult = {}
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
        .catch(error => {
          console.log('Error in lookup list' + error)
        })
      // Run process on server and wait for it for notify
      runProcess(processToRun)
        .then(response => {
          if (typeof response !== 'undefined') {
            processResult = {
              instanceUuid: response.getInstanceuuid(),
              isError: response.getIserror(),
              summary: response.getSummary(),
              resultTableId: response.getResulttableid(),
              logs: response.getLogsList(),
              output: {
                uuid: response.getOutput().getUuid(),
                name: response.getOutput().getName(),
                description: response.getOutput().getDescription(),
                fileName: response.getOutput().getFilename(),
                output: response.getOutput().getOutput(),
                outputStream: response.getOutput().getOutputstream(),
                reportExportType: response.getOutput().getReportexporttype()
              }
            }
            dispatch('finishProcess', processResult)
          }
        })
        .catch(error => {
          console.log('Error running the process', error)
          dispatch('finishProcess', processResult)
        })
    },
    setShowDialog({ commit }, process) {
      if (typeof process === 'undefined') {
        commit('setCloseDialog')
      } else {
        commit('setShowDialog', process)
      }
    },
    finishProcess({ commit }, processOutput) {
      // console.log('action - finishProcess', processOutput)
      if (!processOutput.isError) {
        commit('openReport', processOutput)
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
