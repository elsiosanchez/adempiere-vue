import { getProcess as getProcessFromDictionary } from '@/api/ADempiere'
import { convertField, evalutateTypeField, isEmptyValue } from '@/utils/ADempiere'
import language from '@/lang'

const process = {
  state: {
    process: []
  },
  mutations: {
    addProcess(state, payload) {
      state.process.push(payload)
    },
    dictionaryResetCacheProcess(state, payload) {
      state.process = payload
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

            const additionalAttributes = {
              processUuid: response.getUuid(),
              processId: response.getId(),
              parentUuid: response.getUuid(),
              containerUuid: response.getUuid(),
              panelType: panelType
            }

            //  Convert from gRPC
            var fieldsRangeList = []
            var fieldDefinitionList = response.getParametersList().map((fieldItem, index) => {
              var someAttributes = {
                ...additionalAttributes,
                fieldListIndex: index
              }

              if (!isEmptyValue(fieldItem.parsedDefaultValue) && String(fieldItem.parsedDefaultValue) !== '-1') {
                fieldItem.isShowedFromUser = true
              }

              if (fieldItem.getIsrange() && evalutateTypeField(fieldItem.getDisplaytype()) === 'NumberBase') {
                fieldsRangeList.push(convertField(fieldItem, someAttributes, true))
              }

              return convertField(fieldItem, someAttributes)
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
            var actions = []
            actions.push({
              name: language.t('components.RunProcess'),
              processName: response.getName(),
              type: 'action',
              action: 'startProcess',
              uuid: response.getUuid(),
              id: response.getId(),
              description: response.getDescription(),
              help: response.getHelp(),
              isReport: response.getIsreport(),
              accessLevel: response.getAccesslevel(),
              showHelp: response.getShowhelp(),
              isDirectPrint: response.getIsdirectprint(),
              reportExportType: undefined
            }, {
              name: language.t('components.ChangeParameters'),
              processName: response.getName(),
              type: 'process',
              action: 'changeParameters',
              uuid: response.getUuid(),
              id: response.getId(),
              description: response.description,
              help: response.getHelp(),
              isReport: response.getIsreport(),
              accessLevel: response.getAccesslevel(),
              showHelp: response.getShowhelp(),
              isDirectPrint: response.getIsdirectprint()
            })

            var summaryAction = {
              name: language.t('components.RunProcessAs'),
              processName: response.getName(),
              type: 'summary',
              action: '',
              childs: [],
              uuid: response.getUuid(),
              id: response.getId(),
              description: response.getDescription(),
              help: response.getHelp(),
              isReport: response.getIsreport(),
              accessLevel: response.getAccesslevel(),
              showHelp: response.getShowhelp(),
              isDirectPrint: response.getIsdirectprint()
            }
            reportExportTypeList.forEach(actionValue => {
              //  Push values
              summaryAction.childs.push({
                name: language.t('components.ExportTo') + ' (' + actionValue.name + ')',
                processName: response.getName(),
                type: 'action',
                action: 'startProcess',
                uuid: response.getUuid(),
                id: response.getId(),
                description: actionValue.description,
                help: response.getHelp(),
                isReport: response.getIsreport(),
                accessLevel: response.getAccesslevel(),
                showHelp: response.getShowhelp(),
                isDirectPrint: response.getIsdirectprint(),
                reportExportType: actionValue.reportExportType
              })
            })
            //  Add summary Actions
            actions.push(summaryAction)

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

            dispatch('addPanel', processDefinition)
            commit('addProcess', processDefinition)

            //  Add process menu
            dispatch('setContextMenu', {
              containerUuid: response.getUuid(),
              relations: [],
              actions: actions,
              references: []
            })
            resolve(processDefinition)
          })
          .catch(error => {
            console.warn('Dictionary Process (State) - Error ' + error)
            reject(error)
          })
      })
    }
  },
  getters: {
    getProcess: (state) => (processUuid) => {
      return state.process.find(
        item => item.uuid === processUuid
      )
    },
    getProcessById: (state) => (processId) => {
      return state.process.find(
        item => item.id === parseInt(processId)
      )
    }
  }
}

export default process
