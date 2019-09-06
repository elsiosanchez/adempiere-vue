import { runProcess, requestProcessActivity } from '@/api/ADempiere'
import { showNotification } from '@/utils/ADempiere/notification'
import language from '@/lang'

const processControl = {
  state: {
    inExecution: [], // process not response from server
    visibleDialog: false,
    reportObject: {},
    reportList: [],
    metadata: {},
    process: [], // process to run finish
    sessionProcess: [],
    inRequestMetadata: []
  },
  mutations: {
    // Add process in execution
    addInExecution(state, payload) {
      state.inExecution.push(payload)
    },
    // Delete process in execution afther some response from server
    deleteInExecution(state, payload) {
      state.inExecution = state.inExecution.filter(item => item.containerUuid !== payload.containerUuid)
    },
    // Add process in request metadata from server
    addInRequestMetadata(state, payload) {
      state.inRequestMetadata.push(payload)
    },
    // Delete process in request metadata
    deleteInRequestMetadata(state, payload) {
      state.inRequestMetadata = state.inRequestMetadata.filter(item => item !== payload)
    },
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
    },
    clearProcessControl(state) {
      state.inExecution = [] // process not response from server
      state.reportObject = {}
      state.reportList = []
      state.metadata = {}
      state.process = [] // process to run finish
      state.sessionProcess = []
      state.inRequestMetadata = []
    }
  },
  actions: {
    // Supported Actions for it
    startProcess({ commit, dispatch, getters, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        // TODO: Add support to evaluate params to send
        const samePocessInExecution = getters.getInExecution(params.containerUuid)
        // exists some call to executed process with container uuid
        if (samePocessInExecution) {
          return reject({
            error: 0,
            message: `In this process (${samePocessInExecution.name}) there is already an execution in progress.`
          })
        }

        var reportExportType
        if (params.action.reportExportType === undefined) {
          reportExportType = params.reportFormat
        } else {
          reportExportType = params.action.reportExportType
        }
        var finalParameters = rootGetters.getParametersProcessToServer(params.action.uuid)

        var selection = []
        var tableName, recordId
        if (params.panelType) {
          if (params.panelType === 'browser') {
            selection = rootGetters.getSelectionToServer(params.containerUuid)
          }
          if (params.panelType === 'window') {
            var tab = rootGetters.getTab(params.parentUuid, params.containerUuid)
            tableName = tab.tableName
            var field = rootGetters.getFieldFromColumnName(params.containerUuid, tableName + '_ID')
            recordId = field.value
          }
        }

        var processDefinition = rootGetters.getProcess(params.action.uuid)

        var processToRun = {
          uuid: processDefinition.uuid,
          id: processDefinition.id,
          name: processDefinition.name,
          description: processDefinition.description,
          reportExportType: reportExportType,
          parameters: finalParameters.params,
          selection: selection,
          tableName: tableName,
          recordId: recordId,
          isProcessing: true,
          instanceUuid: undefined
        }
        showNotification({
          title: language.t('notifications.processing'),
          message: processDefinition.name,
          summary: processDefinition.description,
          type: 'info'
        })
        // Run process on server and wait for it for notify
        var processResult = {
          timeInitialized: (new Date()).getTime(),
          containerUuid: params.containerUuid,
          action: processToRun.name,
          name: processDefinition.name,
          description: processDefinition.description,
          instanceUuid: '',
          processUuid: processToRun.uuid,
          processId: processToRun.id,
          processName: processToRun.processName,
          parameters: finalParameters.params,
          isError: false,
          isProcessing: true,
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
        commit('addInExecution', processResult)
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

            var processResultSucess = {
              action: processToRun.name,
              instanceUuid: response.getInstanceuuid().trim(),
              url: link.href,
              download: link.download,
              processUuid: processToRun.uuid.trim(),
              processId: processToRun.id,
              processName: processToRun.processName,
              isError: response.getIserror(),
              isProcessing: response.getIsprocessing(),
              isReport: processDefinition.isReport,
              summary: response.getSummary(),
              resultTableId: response.getResulttableid(),
              logs: logList,
              output: output
            }
            Object.assign(processResult, processResultSucess)
            dispatch('finishProcess', processResult)
            resolve(processResult)
          })
          .catch(error => {
            Object.assign(processResult, {
              isError: true,
              isProcessing: false
            })
            dispatch('finishProcess', processResult)
            console.log('Error running the process', error)
            reject(error)
          })
          .finally(() => {
            commit('deleteInExecution', {
              containerUuid: params.containerUuid
            })
            dispatch('deleteRecordContainer', processToRun.uuid)
          })
      })
    },
    getSessionProcessFromServer({ commit, dispatch, getters, rootGetters }) {
      return new Promise((resolve, reject) => {
        // Example of process Activity
        requestProcessActivity()
          .then(response => {
            var responseList = response.getResponsesList().map(responseItem => {
              var uuid = responseItem.getUuid()
              var responseOutput = responseItem.getOutput()
              var output
              if (responseOutput !== undefined) {
                output = {
                  uuid: uuid,
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

              var processMetadata = rootGetters.getProcess(uuid)
              // if no exists metadata process in store and no request progess
              if (processMetadata === undefined && getters.getInRequestMetadata(uuid) === undefined) {
                commit('addInRequestMetadata', uuid)
                dispatch('getProcessFromServer', uuid)
                  .finally(() => {
                    commit('deleteInRequestMetadata', uuid)
                  })
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
              processList: responseList,
              nextPageToken: response.getNextPageToken()
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
          commit('setCloseDialog')
        } else {
          commit('setMetadata', params.action)
          commit('setShowDialog')
        }
      } else if (params.type === 'window') {
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
    },
    clearProcessControl({ commit }) {
      commit('clearProcessControl')
    }
  },
  getters: {
    /**
     * Running processes that have not received a response from the server
     * @param {string} containerUuid
     */
    getInExecution: (state) => (containerUuid) => {
      return state.inExecution.find(item => item.containerUuid === containerUuid)
    },
    /**
     * Process for send to server, or send without response
     */
    getAllInExecution: (state) => {
      return state.inExecution
    },
    /**
     * Process send to server, with response from server
     */
    getAllFinishProcess: (state) => {
      return state.process
    },
    /**
     * Process receibed from server associated whith this session
     */
    getAllSessionProcess: (state) => {
      return state.sessionProcess
    },
    /**
     * Process request metadata from server filter form uuid process
     */
    getInRequestMetadata: (state) => (containerUuid) => {
      return state.inRequestMetadata.find(item => item === containerUuid)
    },
    getProcessResult: (state) => {
      return state.reportObject
    },
    getCachedReport: (state) => (instanceUuid) => {
      var cachedReport = state.reportList.find(
        item => item.instanceUuid === instanceUuid
      )
      return cachedReport
    }
  }
}

export default processControl
