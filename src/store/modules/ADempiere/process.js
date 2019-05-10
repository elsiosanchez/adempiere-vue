import { getProcess as getProcessFromDictionary } from '@/api/ADempiere/dictionary'
import { convertFieldFromGRPC } from '@/utils/ADempiere'

const process = {
  state: {
    process: [],
    processesList: []
  },
  mutations: {
    addProcess(state, payload) {
      state.process.push(payload)
    },
    dictionaryResetCacheProcess(state, payload) {
      state.process = payload
      state.processesList = payload
    }
  },
  actions: {
    getProcessFromServer: ({ commit }, processUuid) => {
      return new Promise((resolve, reject) => {
        getProcessFromDictionary(processUuid)
          .then(response => {
            var parameterList = response.getParametersList()
            var additionalAttributes = {
              processUuid: response.getUuid(),
              processId: response.getId(),
              parentUuid: response.getUuid(),
              containerUuid: response.getUuid()
            }

            var fieldDefinitionList = parameterList.map((processItem) => {
              return convertFieldFromGRPC(processItem, additionalAttributes)
            })
            //  Get export list
            var reportExportTypeList = response.getReportexporttypesList().map((reportType) => {
              return {
                name: reportType.getName(),
                description: reportType.getDescription(),
                reportExportType: reportType.getType()
              }
            })
            //  Default Action
            var processActions = [
              {
                name: 'Run Process As',
                type: 'summary',
                action: '',
                childs: [],
                uuid: response.getUuid(),
                description: response.getDescription(),
                help: response.getHelp(),
                isReport: response.getIsreport(),
                accessLevel: response.getAccesslevel(),
                showHelp: response.getShowhelp(),
                isDirectPrint: response.getIsdirectprint()
              }
            ]
            reportExportTypeList.forEach((actionValue) => {
              var action = {
                name: 'Export to (' + actionValue.name + ')',
                type: 'action',
                action: 'startProcess',
                uuid: response.getUuid(),
                description: actionValue.description,
                help: response.getHelp(),
                isReport: response.getIsreport(),
                accessLevel: response.getAccesslevel(),
                showHelp: response.getShowhelp(),
                isDirectPrint: response.getIsdirectprint(),
                reportExportType: actionValue.reportExportType
              }
              //  Push values
              processActions[0].childs.push(action)
            })
            var panel = {
              id: response.getId(),
              uuid: response.getUuid(),
              name: response.getName(),
              parentUuid: response.getUuid(),
              fieldList: fieldDefinitionList
            }

            var processDefinition = {
              id: response.getId(),
              uuid: response.getUuid(),
              value: response.getValue(),
              name: response.getName(),
              description: response.getDescription(),
              help: response.getHelp(),
              isReport: response.getIsreport(),
              accessLevel: response.getAccesslevel(),
              showHelp: response.getShowhelp(),
              isDirectPrint: response.getIsdirectprint(),
              reportExportTypeList: reportExportTypeList,
              fieldList: fieldDefinitionList
            }
            //  Add process menu
            var contextMenu = {
              containerUuid: response.getUuid(),
              relations: [],
              actions: processActions,
              references: []
            }
            commit('addPanel', panel)
            commit('addProcess', processDefinition)
            commit('setMenu', contextMenu)
            resolve(processDefinition)
          })
          .catch(err => {
            console.warn('Dictionary Process (State ) - Error ' + err)
          })
      })
    }
  },
  getters: {
    getProcess: (state) => (processUuid) => {
      var process = state.process.find(
        item => item.uuid === processUuid
      )
      return process
    },
    getParametersList: (state) => (processUuid) => {
      var process = state.process.find(
        item => item.uuid === processUuid
      )
      if (typeof process === 'undefined') {
        return process
      }
      return process.parameterList
    },
    getProcessListTab: (state) => {
      return state.processesList
    }
  }
}

export default process
