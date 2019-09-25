import { getBrowser as getBrowserFromDictionary } from '@/api/ADempiere'
import { convertField, evalutateTypeField, isEmptyValue } from '@/utils/ADempiere'

const browser = {
  state: {
    browser: []
  },
  mutations: {
    addBrowser(state, payload) {
      state.browser.push(payload)
    },
    dictionaryResetCacheBrowser(state, payload) {
      state.browser = payload
    },
    changeShowedCriteriaBrowser(state, payload) {
      payload.browser.isShowedCriteria = payload.changeShowedCriteria
    }
  },
  actions: {
    getBrowserFromServer: ({ commit, dispatch }, browserUuid) => {
      return new Promise((resolve, reject) => {
        getBrowserFromDictionary(browserUuid)
          .then(response => {
            const panelType = 'browser'
            var fieldsList = response.getFieldsList()
            const query = response.getQuery()
            const whereClause = response.getWhereclause()
            const additionalAttributes = {
              browserUuid: response.getUuid(),
              browserId: response.getId(),
              parentUuid: response.getUuid(), // TODO: Evaluate if is required
              containerUuid: response.getUuid(),
              panelType: panelType
            }

            //  Convert from gRPC
            var fieldsRangeList = []
            var isMandatoryParams = false
            fieldsList = fieldsList.map((fieldItem, index) => {
              const someAttributes = {
                ...additionalAttributes,
                fieldListIndex: index
              }
              if (fieldItem.getIsrange() && evalutateTypeField(fieldItem.getDisplaytype()) === 'NumberBase') {
                fieldsRangeList.push(
                  convertField(fieldItem, someAttributes, true)
                )
              }
              var field = convertField(fieldItem, someAttributes)
              if ((query.includes('@' + field.columnName + '@') ||
                query.includes('@' + field.columnName + '_To@') ||
                whereClause.includes('@' + field.columnName + '@') ||
                whereClause.includes('@' + field.columnName + '_To@')) &&
                field.isQueryCriteria) {
                field.isMandatory = true
                field.isMandatoryFromLogic = true
                field.isShowedFromUser = true
              }

              if (!isEmptyValue(field.parsedDefaultValue) && String(field.parsedDefaultValue) !== '-1') {
                field.isShowedFromUser = true
              }

              // TODO: Evaluate if not change when iterate
              isMandatoryParams = field.isMandatory
              return field
            })
            fieldsList = fieldsList.concat(fieldsRangeList)

            //  Get dependent fields
            fieldsList
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

            //  Panel for save on store
            const newBrowser = {
              id: response.getId(),
              uuid: response.getUuid(),
              containerUuid: response.getUuid(),
              parentUuid: response.getUuid(),
              value: response.getValue(),
              name: response.getName(),
              description: response.getDescription(),
              help: response.getHelp(),
              // sql query
              query: query,
              whereClause: whereClause,
              orderByClause: response.getOrderbyclause(),
              //
              isUpdateable: response.getIsupdateable(),
              isDeleteable: response.getIsdeleteable(),
              isSelectedByDefault: response.getIsselectedbydefault(),
              isCollapsibleByDefault: response.getIscollapsiblebydefault(),
              isExecutedQueryByDefault: response.getIsexecutedquerybydefault(),
              isShowTotal: response.getIsshowtotal(),
              isActive: response.getIsactive(),
              viewUuid: response.getViewuuid(),
              fieldList: fieldsList,
              panelType: panelType,
              // app attributes
              isMandatoryParams: isMandatoryParams,
              isShowedCriteria: Boolean(fieldsList.length && isMandatoryParams)
            }
            //  Convert from gRPC process list
            const process = response.getProcess()
            var actions = []
            if (process) {
              actions.push({
                name: process.getName(),
                type: 'process',
                uuid: process.getUuid(),
                description: process.getDescription(),
                help: process.getHelp(),
                isReport: process.getIsreport(),
                accessLevel: process.getAccesslevel(),
                showHelp: process.getShowhelp(),
                isDirectPrint: process.getIsdirectprint()
              })

              // TODO: convert gRPC attributes from response.getProcess() to object
              // Add process asociate in store
              // var processStore = rootGetters.getProcess(process.getUuid())
              // if (processStore === undefined) {
              //   dispatch('getProcessFromServer', process.getUuid())
              // }
            }

            dispatch('addPanel', newBrowser)
            commit('addBrowser', newBrowser)

            //  Add process menu
            dispatch('setContextMenu', {
              containerUuid: response.getUuid(),
              relations: [],
              actions: actions,
              references: []
            })
            resolve(newBrowser)
          })
          .catch(error => {
            console.warn('Dictionary Browser - Error ' + error.code + ': ' + error.message)
            reject(error)
          })
      })
    },
    changeShowedCriteriaBrowser: ({ commit, state, getters }, parameters) => {
      commit('changeShowedCriteriaBrowser', {
        browser: getters.getBrowser(parameters.containerUuid),
        changeShowedCriteria: parameters.isShowedCriteria
      })
    }
  },
  getters: {
    getBrowser: (state) => (browserUuid) => {
      return state.browser.find(
        item => item.uuid === browserUuid
      )
    }
  }
}

export default browser
