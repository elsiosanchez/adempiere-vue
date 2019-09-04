import {
  getWindow as getWindowFromDictionary,
  getTab as getTabfromDictionary
} from '@/api/ADempiere'
import { convertContextInfoFromGRPC, convertField, getFieldTemplate } from '@/utils/ADempiere'
import language from '@/lang'

const window = {
  state: {
    window: []
  },
  mutations: {
    addWindow(state, payload) {
      state.window.push(payload)
    },
    dictionaryResetCacheWindow(state, payload) {
      state.window = payload
    },
    changeShowedDetailWindow(state, payload) {
      payload.window.isShowedDetail = payload.changeShowedDetail
    },
    changeShowedRecordWindow(state, payload) {
      payload.window.isShowedRecordNavigation = payload.isShowedRecordNavigation
    },
    setCurrentTab(state, payload) {
      payload.window.currentTabUuid = payload.tabUuid
    }
  },
  actions: {
    getWindowFromServer: ({ commit, dispatch }, windowUuid) => {
      return new Promise((resolve, reject) => {
        getWindowFromDictionary(windowUuid)
          .then(response => {
            var newWindow = {
              id: response.getId(),
              uuid: windowUuid,
              name: response.getName(),
              contextInfo: convertContextInfoFromGRPC(response.getContextinfo()),
              windowType: response.getWindowtype(),
              isShowedRecordNavigation: undefined
            }
            var tabs = response.getTabsList()
            var firstTab = tabs[0].getTablename()
            var childrenTabs = []
            var parentTabs = []

            tabs = tabs.map(tabItem => {
              var group = {}
              try {
                group = {
                  groupName: tabItem.getFieldgroup().getName(),
                  groupType: tabItem.getFieldgroup().getFieldgrouptype()
                }
              } catch (e) {
                group = {
                  groupName: '',
                  groupType: ''
                }
              }

              var tab = {
                id: tabItem.getId(),
                uuid: tabItem.getUuid(),
                windowUuid: windowUuid,
                name: tabItem.getName(),
                tableName: tabItem.getTablename(),
                tabGroup: group,
                sequence: tabItem.getSequence(),
                tabLevel: tabItem.getTablevel(),
                displayLogic: tabItem.getDisplaylogic(),
                isView: tabItem.getIsview(),
                isDocument: tabItem.getIsdocument(),
                isInserRecrod: tabItem.getIsinsertrecord(),
                isSortTab: tabItem.getIssorttab(), // Tab type Order Tab
                parentTab: Boolean(firstTab === tabItem.getTablename()),
                contextInfo: convertContextInfoFromGRPC(tabItem.getContextinfo()),
                isSingleRow: tabItem.getIssinglerow(),
                // conditionals
                linkColumnName: tabItem.getLinkcolumnname(),
                parentColumnName: tabItem.getParentcolumnname(),
                commitWarning: tabItem.getCommitwarning(),
                query: tabItem.getQuery(),
                whereClause: tabItem.getWhereclause(),
                orderByClause: tabItem.getOrderbyclause(),
                // app properties
                isShowedRecordNavigation: !(tabItem.getIssinglerow())
              }

              //  Convert from gRPC process list
              var actions = []
              actions.push(
                {
                  name: language.t('window.newRecord'),
                  processName: language.t('window.newRecord'),
                  type: 'dataAction',
                  action: 'resetPanelToNew',
                  uuidParent: newWindow.uuid
                },
                {
                  name: language.t('window.deleteRecord'),
                  processName: language.t('window.deleteRecord'),
                  type: 'dataAction',
                  action: 'deleteEntity',
                  uuidParent: newWindow.uuid
                }
              )
              var processList = tabItem.getProcessesList().map(processItem => {
                return {
                  name: processItem.getName(),
                  type: 'process',
                  uuid: processItem.getUuid(),
                  description: processItem.getDescription(),
                  help: processItem.getHelp(),
                  isReport: processItem.getIsreport(),
                  accessLevel: processItem.getAccesslevel(),
                  showHelp: processItem.getShowhelp(),
                  isDirectPrint: processItem.getIsdirectprint()
                }
              })
              actions = actions.concat(processList)

              //  Add process menu
              var contextMenu = {
                containerUuid: tab.uuid,
                relations: [],
                actions: actions,
                references: []
              }
              dispatch('setContextMenu', contextMenu)

              if (tab.parentTab) {
                parentTabs.push(tab)
              } else {
                childrenTabs.push(tab)
              }
              return tab
            })

            var tabProperties = {
              tabsList: tabs,
              currentTab: parentTabs[0],
              tabsListParent: parentTabs,
              tabsListChildren: childrenTabs,
              // app attributes
              isShowedDetail: Boolean(childrenTabs.length > 0),
              currentTabUuid: parentTabs[0].uuid
            }

            newWindow = {
              ...newWindow,
              ...tabProperties
            }
            commit('addWindow', newWindow)
            resolve(newWindow)
          })
          .catch(error => {
            console.warn('Dictionary Window (State Window) - Error ' + error.code + ': ' + error.message)
            reject(error)
          })
      })
    },
    getTabAndFieldFromServer: ({ commit, dispatch }, objectParams) => {
      return new Promise((resolve, reject) => {
        getTabfromDictionary(objectParams.containerUuid)
          .then(response => {
            const panelType = 'window'
            var fieldsList = response.getFieldsList()
            var additionalAttributes = {
              parentUuid: objectParams.parentUuid,
              containerUuid: objectParams.containerUuid,
              isShowedFromUser: true,
              panelType: panelType,
              //
              isReadOnlyFromForm: false
            }

            var fieldUuidsequence = 0
            //  Convert from gRPC
            fieldsList = fieldsList.map((item, index) => {
              item = convertField(item, {
                ...additionalAttributes,
                fieldListIndex: index
              })
              if (item.sequence > fieldUuidsequence) {
                fieldUuidsequence = item.sequence
              }
              return item
            })

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

            if (!fieldsList.find(field => field.columnName === 'UUID')) {
              var attributesOverwrite = {
                sequence: (fieldUuidsequence + 10)
              }
              var field = getFieldTemplate(attributesOverwrite)
              field.columnName = 'UUID'
              fieldsList.push(field)
            }
            //  Panel for save on store
            var panel = {
              id: response.getId(),
              uuid: objectParams.containerUuid,
              name: response.getName(),
              parentUuid: objectParams.parentUuid,
              fieldList: fieldsList,
              tableName: response.getTablename(),
              linkColumnName: response.getLinkcolumnname(),
              parentColumnName: response.getParentcolumnname(),
              panelType: panelType
            }

            dispatch('addPanel', panel)
            resolve(panel)
          })
          .catch(error => {
            console.warn('Dictionary Tab (State Window) - Error ' + error.code + ': ' + error.message)
            reject(error)
          })
      })
    },
    changeShowedDetailWindow: ({ commit, state }, params) => {
      var window = state.window.find(itemWindow => {
        return itemWindow.uuid === params.containerUuid
      })
      commit('changeShowedDetailWindow', {
        window: window,
        changeShowedDetail: params.isShowedDetail
      })
    },
    changeShowedRecordWindow: ({ commit, state }, params) => {
      var window = state.window.find(itemWindow => {
        return itemWindow.uuid === params.parentUuid
      })
      commit('changeShowedRecordWindow', {
        window: window,
        isShowedRecordNavigation: params.isShowedRecordNavigation
      })
    },
    /**
     * @param {string} params.parentUuid
     * @param {string} params.containerUuid
     */
    setCurrentTab: ({ commit, getters }, params) => {
      // var window = state.window.find(item => item.uuid === params.parentUuid)
      commit('setCurrentTab', {
        window: getters.getWindow(params.parentUuid),
        tabUuid: params.containerUuid
      })
    }
  },
  getters: {
    getWindow: (state) => (windowUuid) => {
      return state.window.find(
        item => item.uuid === windowUuid
      )
    },
    getIsShowedRecordNavigation: (state, getters) => (windowUuid) => {
      return getters.getWindow(windowUuid).isShowedRecordNavigation
    },
    getTab: (state, getters) => (windowUuid, tabUuid) => {
      const window = getters.getWindow(windowUuid)
      if (window) {
        return window.tabsList.find(tabItem => {
          return tabItem.uuid === tabUuid
        })
      }
      return window
    }
  }
}

export default window
