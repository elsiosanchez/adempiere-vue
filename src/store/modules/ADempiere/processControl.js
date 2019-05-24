import {
  runProcess,
  requestProcessActivity,
  getObjectListFromCriteria,
  getBrowserSearch
} from '@/api/ADempiere/data'

const processControl = {
  state: {
    visibleDialog: false,
    reportObject: {},
    reportList: [],
    serveList: [],
    metadata: {},
    process: [],
    sessionProcess: []
  },
  mutations: {
    addStartedProcess(state, payload) {
      state.process.push(payload)
    },
    addServerProcess(state, payload) {
      state.serveList.push(payload)
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
    setReportValues(state, payload) {
      state.reportObject = payload
      state.reportList.push(payload)
    },
    setSessionProcess(state, payload) {
      state.sessionProcess = payload.responses
    },
    changeFormatReport(state, payload) {
      state.reportFormat = payload
    }
  },
  actions: {
    // Supported Actions for it
    startProcess({ commit, rootGetters, dispatch }, payload) {
      var reportExportType
      if (typeof payload.action.reportExportType === 'undefined') {
        reportExportType = payload.reportFormat
      } else {
        reportExportType = payload.action.reportExportType
      }
      var processResult = {}
      var parameters = rootGetters.getPanelParameters(payload.action.uuid)
      var processToRun = {
        uuid: payload.action.uuid,
        name: payload.action.name,
        description: payload.action.description,
        help: payload.action.help,
        isReport: payload.action.isReport,
        accessLevel: payload.accessLevel,
        showHelp: payload.action.showHelp,
        isDirectPrint: payload.action.isDirectPrint,
        reportExportType: reportExportType,
        parameters: parameters
      }
      requestProcessActivity({ commit }, process)
        .then(response => {
          console.log(response)
          var server = response.getResponsesList()
          console.log(server)
          commit('addStartedProcess', server)
        })
      // console.log(processToRun)
      commit('addStartedProcess', processToRun)
      getObjectListFromCriteria('C_BPartner', "IsCustomer = 'Y'")
        .then(response => {
          console.log(response)
          response.getRecordsList().forEach(item => {
            console.log(item.getValuesMap())
          })
        })
        .catch(error => {
          console.log(error)
        })
      var browserToSearch = {
        uuid: '8aaf072a-fb40-11e8-a479-7a0060f0aa01',
        parameters: [
          {
            columnName: 'I_DocStatus',
            value: 'CO'
          }
        ]
      }
      //  Browser Search
      getBrowserSearch(browserToSearch)
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
      // Run process on server and wait for it for notify
      runProcess(processToRun)
        .then(response => {
          processResult = {
            instanceUuid: response.getInstanceuuid().trim(),
            processUuid: processToRun.uuid.trim(),
            isError: response.getIserror(),
            summary: response.getSummary(),
            resultTableId: response.getResulttableid(),
            logs: response.getLogsList(),
            output: {
              uuid: response.getOutput().getUuid(),
              name: response.getOutput().getName(),
              description: response.getOutput().getDescription(),
              fileName: response.getOutput().getFilename().replace(/ /g, ''),
              output: response.getOutput().getOutput(),
              outputStream: response.getOutput().getOutputstream(),
              reportExportType: response.getOutput().getReportexporttype()
            }
          }
          dispatch('finishProcess', processResult)
        })
        .catch(error => {
          console.log('Error running the process', error)
        })
    },
    getSessionProcessFromServer({ commit }) {
      // Example of process Activity
      requestProcessActivity()
        .then(response => {
          /* var infoLogs = response.getLogsList().map((log) => {
            return {
              recordId: log.getRecordid(),
              log: log.getLog()
            }
          }) */
          var responseList = response.getResponsesList().map((responseItem) => {
            return {
              instanceUuid: responseItem.getInstanceuuid(),
              isError: responseItem.getIserror(),
              summary: responseItem.getSummary(),
              resultTableId: responseItem.getResulttableid(),
              isProcessing: responseItem.getIsprocessing(),
              logs: responseItem.getLogsList(),
              output: responseItem.getOutput()
            }
          })
          responseList.forEach((item) => {
            if (typeof item.output !== 'undefined') {
              item.output = {
                uuid: item.output.getUuid(),
                name: item.output.getName(),
                description: item.output.getDescription(),
                fileName: item.output.getFilename(),
                output: item.output.getOutput(),
                outputStream: item.output.getOutputstream(),
                reportExportType: item.output.getReportexporttype()
              }
            }
          })
          var processResponseList = {
            recordCount: response.getRecordcount(),
            responses: responseList
          }
          commit('setSessionProcess', processResponseList)
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
    },
    finishProcess({ commit }, processOutput) {
      if (!processOutput.isError &&
        typeof processOutput.instanceUuid !== 'undefined' &&
        typeof processOutput.processUuid !== 'undefined' &&
        typeof processOutput.output.fileName !== 'undefined') {
        commit('setReportValues', processOutput)
      }
    },
    changeFormatReport({ commit }, reportFormat) {
      if (typeof reportFormat !== 'undefined') {
        commit('changeFormatReport', reportFormat)
      }
    }
  },
  getters: {
    getServerProcess: (state) => {
      console.log(state)
      return state.serveList
    },
    getActionProcess: (state) => (processUuid) => {
      var process = state.process.find(
        item => item.uuid === processUuid
      )
      return process
    },
    getRunningProcess: (state, rootGetters) => (processUuid) => {
      var processList = state.process.map((item) => {
        // console.log(item)
        var process = rootGetters.getProcess(item.uuid)
        if (typeof process !== undefined) {
          return {
            ...process,
            action: item.name,
            help: item.help,
            output: item.output,
            logs: item.logs,
            summary: item.summary
          }
        }
      })
      console.log(processList)
      return processList
    },
    getProcessResult: (state) => {
      return state.reportObject
    },
    getCachedReport: (state) => (instanceUuid) => {
      var cachedReport = state.reportList.find(
        item => item.instanceUuid === instanceUuid
      )
      return cachedReport
    },
    getSessionProcess: (state) => (instanceUuid) => {
      var sessionProcess = state.sessionProcess.find(
        item => item.instanceUuid === instanceUuid
      )
      return sessionProcess
    }
  }
}

export default processControl
