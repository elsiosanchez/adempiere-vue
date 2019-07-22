import {
  runProcess,
  requestProcessActivity
} from '@/api/ADempiere/data'
import { showNotification } from '@/utils/ADempiere/notification'

const processControl = {
  state: {
    visibleDialog: false,
    reportObject: {},
    reportList: [],
    metadata: {},
    process: [],
    sessionProcess: []
  },
  mutations: {
    addStartedProcess(state, payload) {
      state.process.push(payload)
    },
    dataResetCacheProcess(state, payload) {
      state.process = payload
    },
    setShowDialog(state) {
      state.visibleDialog = true
    },
    setCloseDialog(state) {
      state.visibleDialog = false
    },
    setMetadata(state, payload) {
      state.metadata = payload
    },
    setReportValues(state, payload) {
      state.reportObject = payload
      state.reportList.push(payload)
    },
    setSessionProcess(state, payload) {
      state.sessionProcess = payload.processList
    },
    changeFormatReport(state, payload) {
      state.reportFormat = payload
    }
  },
  actions: {
    // Supported Actions for it
    startProcess({ commit, dispatch, rootGetters }, params) {
      var reportExportType
      if (typeof params.action.reportExportType === 'undefined') {
        reportExportType = params.reportFormat
      } else {
        reportExportType = params.action.reportExportType
      }
      var finalParameters = rootGetters.getParamsProcessToServer(params.containerUuid)

      var selection = []
      if (typeof params.parentUuid !== undefined) {
        selection = rootGetters.getSelectionToServer(params.parentUuid)
      }

      var processToRun = {
        uuid: params.action.uuid,
        name: params.action.name,
        processName: params.processName,
        description: params.action.description,
        help: params.action.help,
        isReport: params.action.isReport,
        accessLevel: params.accessLevel,
        showHelp: params.action.showHelp,
        isDirectPrint: params.action.isDirectPrint,
        reportExportType: reportExportType,
        parameters: finalParameters.params,
        selection: selection
      }
      var notificationParams = {
        title: 'processing',
        message: processToRun.processName,
        type: 'info'
      }
      showNotification(notificationParams)
      // Run process on server and wait for it for notify
      var processResult = {}
      runProcess(processToRun)
        .then(response => {
          var output = {
            uuid: '',
            name: '',
            description: '',
            fileName: '',
            output: '',
            outputStream: '',
            reportExportType: ''
          }

          if (typeof response.getOutput() !== 'undefined') {
            var responseOutput = response.getOutput()
            output = {
              uuid: responseOutput.getUuid(),
              name: responseOutput.getName(),
              description: responseOutput.getDescription(),
              fileName: responseOutput.getFilename(),
              output: responseOutput.getOutput(),
              mimeType: responseOutput.getMimetype(),
              outputStream: responseOutput.getOutputstream(),
              reportExportType: responseOutput.getReportexporttype()
            }
          }
          var logList = response.getLogsList()
          if (typeof logList !== undefined) {
            logList = logList.map(itemLog => {
              return {
                log: itemLog.getLog(),
                recordId: itemLog.getRecordid()
              }
            })
          } else {
            logList = []
          }

          var link = {
            href: undefined,
            download: undefined
          }
          if (processToRun.isReport) {
            var blob = new Blob([output.outputStream], { type: output.mimeType })
            link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = output.fileName
            if (reportExportType !== 'pdf' && reportExportType !== 'html') {
              link.click()
            }
          }

          processResult = {
            action: processToRun.name,
            instanceUuid: response.getInstanceuuid().trim(),
            url: link.href,
            download: link.download,
            processUuid: processToRun.uuid.trim(),
            processName: processToRun.processName,
            isError: response.getIserror(),
            isProcessing: response.getIsprocessing(),
            isReport: processToRun.isReport,
            summary: response.getSummary(),
            resultTableId: response.getResulttableid(),
            logs: logList,
            output: output
          }
          //  parentUuid is the identifier of the container where the process is called
          dispatch('deleteRecordContainer', params.parentUuid)
          dispatch('finishProcess', processResult)
        })
        .catch(error => {
          processResult = {
            action: processToRun.name,
            instanceUuid: '',
            processUuid: processToRun.uuid.trim(),
            processName: processToRun.processName,
            isError: true,
            isProcessing: false,
            isReport: processToRun.isReport,
            summary: '',
            resultTableId: '',
            logs: [],
            output: {
              uuid: '',
              name: '',
              description: '',
              fileName: '',
              output: '',
              outputStream: '',
              reportExportType: ''
            }
          }
          //  parentUuid is the identifier of the container where the process is called
          dispatch('deleteRecordContainer', params.parentUuid)
          dispatch('finishProcess', processResult)
          console.log('Error running the process', error)
        })
    },
    getSessionProcessFromServer({ commit, dispatch, rootGetters }) {
      return new Promise((resolve, reject) => {
        // Example of process Activity
        requestProcessActivity()
          .then(response => {
            var responseList = response.getResponsesList().map(responseItem => {
              var output = {
                uuid: '',
                name: '',
                description: '',
                fileName: '',
                mimeType: '',
                output: '',
                outputStream: '',
                outputStream_asB64: '',
                outputStream_asU8: '',
                reportExportType: ''
              }
              var responseOutput = responseItem.getOutput()
              if (typeof responseOutput !== 'undefined') {
                output = {
                  uuid: responseOutput.getUuid(),
                  name: responseOutput.getName(),
                  description: responseOutput.getDescription(),
                  fileName: responseOutput.getFilename(),
                  mimeType: responseOutput.getMimetype(),
                  output: responseOutput.getOutput(),
                  outputStream: responseOutput.getOutputstream(),
                  outputStream_asB64: responseOutput.getOutputstream_asB64(),
                  outputStream_asU8: responseOutput.getOutputstream_asU8(),
                  reportExportType: responseOutput.getReportexporttype()
                }
              }
              var logList = responseItem.getLogsList().map(log => {
                return {
                  recordId: log.getRecordid(),
                  log: log.getLog()
                }
              })

              var processMetadata = rootGetters.getProcess(responseItem.getUuid())
              if (typeof processMetadata === 'undefined') {
                dispatch('getProcessFromServer', responseItem.getUuid())
              }
              var process = {
                processUuid: responseItem.getUuid(),
                instanceUuid: responseItem.getInstanceuuid(),
                isError: responseItem.getIserror(),
                isProcessing: responseItem.getIsprocessing(),
                logs: logList,
                output: output,
                parametersMap: responseItem.getParametersMap(),
                resultTableId: responseItem.getResulttableid(),
                summary: responseItem.getSummary()
              }

              return process
            })

            var processResponseList = {
              recordCount: response.getRecordcount(),
              processList: responseList
            }
            commit('setSessionProcess', processResponseList)
            resolve(processResponseList)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    setShowDialog({ commit }, params) {
      if (params.type === 'process') {
        if (typeof params.action === 'undefined') {
          commit('setMetadata', {
            id: null,
            uuid: '',
            name: '',
            description: '',
            parentUuid: '',
            help: '',
            isReport: null,
            accessLevel: null,
            showHelp: '',
            isDirectPrint: null,
            reportExportTypeList: [],
            value: '',
            panelType: params.type,
            fieldList: [],
            keyColumn: '',
            selectionColumn: []
          })
          commit('setCloseDialog')
        } else {
          commit('setMetadata', params.action)
          commit('setShowDialog')
        }
      } else if (params.type === 'search') {
        if (typeof params.action === 'undefined') {
          commit('setCloseDialog')
        } else {
          commit('setMetadata', params.action)
          commit('setShowDialog')
        }
      }
    },
    finishProcess({ commit }, processOutput) {
      if (!processOutput.isError &&
        typeof processOutput.instanceUuid !== 'undefined' &&
        typeof processOutput.processUuid !== 'undefined') {
        var notificationParams = {
          name: processOutput.processName,
          title: 'succesful',
          message: 'processExecuted',
          type: 'success',
          log: (processOutput.log === undefined) ? processOutput.summary : processOutput.log
        }
        showNotification(notificationParams)
        commit('setReportValues', processOutput)
        commit('addStartedProcess', processOutput)
      } else {
        notificationParams = {
          name: processOutput.processName,
          title: 'error',
          message: 'processError',
          type: 'error',
          log: (processOutput.log === undefined) ? processOutput.summary : processOutput.log
        }
        showNotification(notificationParams)
        commit('addStartedProcess', processOutput)
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
    getActionProcess: (state) => (processUuid) => {
      var process = state.process.find(
        item => item.uuid === processUuid
      )
      return process
    },
    getRunningProcess: (state, rootGetters) => {
      Array.prototype.push.apply(state.sessionProcess, state.process)
      var processList = state.sessionProcess.map((item) => {
        var process = rootGetters.getProcess(item.processUuid)
        return {
          ...process,
          instanceUuid: item.instanceUuid,
          output: item.output,
          isError: item.isError,
          logs: item.logs,
          summary: item.summary
        }
      })
      return processList
    },
    // getProcessFinalized: (state, rootGetters) => {
    //   var procesfinalized = state.process.map((item) => {
    //     var process = rootGetters.getProcess(item.processUuid)
    //     return {
    //       ...process,
    //       instanceUuid: item.instanceUuid,
    //       output: item.output,
    //       isError: item.isError,
    //       logs: item.logs,
    //       summary: item.summary
    //     }
    //   })
    //   return procesfinalized
    // },
    getProcessResult: (state) => {
      return state.reportObject
    },
    getCachedReport: (state) => (instanceUuid) => {
      var cachedReport = state.reportList.find(
        item => item.instanceUuid === instanceUuid
      )
      return cachedReport
    },
    getReportInfo: (state) => (procesUuid) => {
      var reportInfo = state.reportList.find(
        item => item.processUuid === procesUuid
      )
      return reportInfo
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
