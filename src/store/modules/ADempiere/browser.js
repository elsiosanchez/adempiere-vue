import { getBrowser } from '@/api/ADempiere/dictionary'
import { convertFieldFromGRPC } from '@/utils/ADempiere'

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
    }
  },
  actions: {
    getBrowserFromServer: ({ commit }, browserUuid) => {
      return new Promise((resolve, reject) => {
        getBrowser(browserUuid)
          .then(response => {
            var fieldsList = response.getFieldsList()

            var additionalAttributes = {
              browserUuid: response.getUuid(),
              browserId: response.getId(),
              parentUuid: response.getUuid(),
              containerUuid: response.getUuid()
            }

            //  Convert from gRPC
            fieldsList = fieldsList.map((item) => {
              item = convertFieldFromGRPC(item, additionalAttributes)
              return item
            })

            //  Get dependent fields
            fieldsList.filter(field => field.parentFieldsList && field.isActive)
              .forEach((field, index, list) => {
                field.parentFieldsList.forEach((parentColumnName) => {
                  var parentField = list.find((parentField) => {
                    return parentField.columnName === parentColumnName && parentColumnName !== field.columnName
                  })
                  if (parentField) {
                    parentField.dependentFieldsList.push(field.columnName)
                  }
                })
              })
            //  Panel for save on store
            var newBrowser = {
              id: response.getId(),
              uuid: response.getUuid(),
              containerUuid: response.getUuid(),
              parentUuid: response.getUuid(),
              value: response.getValue(),
              name: response.getName(),
              description: response.getDescription(),
              help: response.getHelp(),
              whereClause: response.getWhereclause(),
              isUpdateable: response.getIsupdateable(),
              isDeleteable: response.getIsdeleteable(),
              isSelectedByDefault: response.getIsselectedbydefault(),
              isCollapsibleByDefault: response.getIscollapsiblebydefault(),
              isExecutedQueryByDefault: response.getIsexecutedquerybydefault(),
              isShowTotal: response.getIsshowtotal(),
              isActive: response.getIsactive(),
              viewUuid: response.getViewuuid(),
              fieldList: fieldsList
            }

            // //  Convert from gRPC process list
            var process = response.getProcess()
            var actions = []
            if (typeof process !== 'undefined') {
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
            }

            //  Add process menu
            var contextMenu = {
              containerUuid: response.getUuid(),
              relations: [],
              actions: actions,
              references: []
            }

            commit('addPanel', newBrowser)
            commit('addBrowser', newBrowser)
            commit('setMenu', contextMenu)
            resolve(newBrowser)
          })
          .catch(err => {
            console.warn('Dictionary Browser - Error ' + err.code + ': ' + err.message)
            reject(err)
          })
      })
    }
  },
  getters: {
    getBrowser: (state) => (browserUuid) => {
      var browser = state.browser.find(
        item => item.uuid === browserUuid
      )
      return browser
    }
  }
}

export default browser
