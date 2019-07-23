import {
  runProcess,
  requestProcessActivity
} from '@/api/ADempiere/data'
import { showNotification } from '@/utils/ADempiere/notification'
import language from '@/lang'

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
      if (params.action.reportExportType === undefined) {
        reportExportType = params.reportFormat
      } else {
        reportExportType = params.action.reportExportType
      }
      var finalParameters = rootGetters.getParamsProcessToServer(params.containerUuid)

      var selection = []
      if (params.parentUuid !== undefined) {
        selection = rootGetters.getSelectionToServer(params.parentUuid)
      }
      var processDefinition = rootGetters.getProcess(params.action.uuid)

      var processToRun = {
        uuid: processDefinition.uuid,
        name: processDefinition.name,
        reportExportType: reportExportType,
        parameters: finalParameters.params,
        selection: selection
      }
      showNotification({
        title: language.t('notifications.processing'),
        message: processDefinition.name,
        summary: processDefinition.description,
        type: 'info'
      })
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

          if (response.getOutput() !== undefined) {
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
          if (logList !== undefined) {
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
          if (processDefinition.isReport) {
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
            isReport: processDefinition.isReport,
            summary: response.getSummary(),
            resultTableId: response.getResulttableid(),
            logs: logList,
            output: output
          }
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
            isReport: processDefinition.isReport,
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
          dispatch('deleteRecordContainer', processToRun.uuid)
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
              if (responseOutput !== undefined) {
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
              if (processMetadata === undefined) {
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
      if (params.type === 'process' || params.type === 'report') {
        if (params.action === undefined) {
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
        if (params.action === undefined) {
          commit('setCloseDialog')
        } else {
          commit('setMetadata', params.action)
          commit('setShowDialog')
        }
      }
    },
    finishProcess({ commit }, processOutput) {
      var processMessage = {
        name: processOutput.processName,
        title: language.t('notifications.succesful'),
        message: language.t('notifications.processExecuted'),
        type: 'success',
        logs: processOutput.logs,
        summary: processOutput.summary
      }
      if (processOutput.isError) {
        processMessage.title = language.t('notifications.error')
        processMessage.message = language.t('notifications.processError')
        processMessage.type = 'error'
      }
      showNotification(processMessage)
      commit('addStartedProcess', processOutput)
      commit('setReportValues', processOutput)
    },
    changeFormatReport({ commit }, reportFormat) {
      if (reportFormat !== undefined) {
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
