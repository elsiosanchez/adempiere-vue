import { getProcess as getProcessFromDictionary } from '@/api/ADempiere'
import { convertFieldFromGRPC, evalutateTypeField, isEmptyValue } from '@/utils/ADempiere'
import i18n from '@/lang'

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
    getProcessFromServer: ({ commit, dispatch }, processUuid) => {
      return new Promise((resolve, reject) => {
        getProcessFromDictionary(processUuid)
          .then(response => {
            var panelType = 'process'
            if (response.getIsreport()) {
              panelType = 'report'
            }
            var parameterList = response.getParametersList()
            var additionalAttributes = {
              processUuid: response.getUuid(),
              processId: response.getId(),
              parentUuid: response.getUuid(),
              containerUuid: response.getUuid(),
              panelType: panelType
            }

            //  Convert from gRPC
            var fieldsRangeList = []
            var fieldDefinitionList = parameterList.map((fieldItem, index) => {
              var someAttributes = {
                ...additionalAttributes,
                fieldListIndex: index
              }

              if (!isEmptyValue(fieldItem.parsedDefaultValue) && String(fieldItem.parsedDefaultValue) !== '-1') {
                fieldItem.isShowedFromUser = true
              }

              if (fieldItem.getIsrange() && evalutateTypeField(fieldItem.getDisplaytype()) === 'NumberBase') {
                fieldsRangeList.push(convertFieldFromGRPC(fieldItem, someAttributes, true))
              }

              return convertFieldFromGRPC(fieldItem, someAttributes)
            })
            fieldDefinitionList = fieldDefinitionList.concat(fieldsRangeList)

            //  Get dependent fields
            fieldDefinitionList
              .filter(field => field.parentFieldsList && field.isActive)
              .forEach((field, index, list) => {
                field.parentFieldsList.forEach(parentColumnName => {
                  var parentField = list.find(parentField => {
                    return parentField.columnName === parentColumnName && parentColumnName !== field.columnName
                  })
                  if (parentField) {
                    parentField.dependentFieldsList.push(field.columnName)
                  }
                })
              })

            //  Get export list
            var reportExportTypeList = response.getReportexporttypesList().map(reportType => {
              return {
                name: reportType.getName(),
                description: reportType.getDescription(),
                reportExportType: reportType.getType()
              }
            })
            //  Default Action
            var processActions = []
            processActions.push({
              name: i18n.t('components.RunProcess'),
              processName: response.getName(),
              type: 'action',
              action: 'startProcess',
              uuid: response.getUuid(),
              description: response.getDescription(),
              help: response.getHelp(),
              isReport: response.getIsreport(),
              accessLevel: response.getAccesslevel(),
              showHelp: response.getShowhelp(),
              isDirectPrint: response.getIsdirectprint(),
              reportExportType: undefined
            }, {
              name: i18n.t('components.ChangeParameters'),
              processName: response.getName(),
              type: 'process',
              action: 'changeParameters',
              uuid: response.getUuid(),
              description: response.description,
              help: response.getHelp(),
              isReport: response.getIsreport(),
              accessLevel: response.getAccesslevel(),
              showHelp: response.getShowhelp(),
              isDirectPrint: response.getIsdirectprint()
            })

            var summaryAction = {
              name: i18n.t('components.RunProcessAs'),
              processName: response.getName(),
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
            reportExportTypeList.forEach(actionValue => {
              var action = {
                name: i18n.t('components.ExportTo') + ' (' + actionValue.name + ')',
                processName: response.getName(),
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
              summaryAction.childs.push(action)
            })
            //  Add summary Actions
            processActions.push(summaryAction)

            var processDefinition = {
              id: response.getId(),
              uuid: response.getUuid(),
              name: response.getName(),
              description: response.getDescription(),
              parentUuid: response.getUuid(),
              help: response.getHelp(),
              isReport: response.getIsreport(),
              accessLevel: response.getAccesslevel(),
              showHelp: response.getShowhelp(),
              isDirectPrint: response.getIsdirectprint(),
              reportExportTypeList: reportExportTypeList,
              value: response.getValue(),
              panelType: panelType,
              fieldList: fieldDefinitionList
            }
            //  Add process menu
            var contextMenu = {
              containerUuid: response.getUuid(),
              relations: [],
              actions: processActions,
              references: []
            }
            dispatch('addPanel', processDefinition)
            commit('addProcess', processDefinition)
            dispatch('setContextMenu', contextMenu)
            resolve(processDefinition)
          })
          .catch(error => {
            console.warn('Dictionary Process (State ) - Error ' + error)
            reject(error)
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
      if (process === undefined) {
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
