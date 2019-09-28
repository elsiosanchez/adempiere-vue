import {
  getWindow as getWindowMetadata,
  getTab as getTabMetadata
} from '@/api/ADempiere/dictionary'
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
    changeTabIsLoadRecord(state, payload) {
      payload.tab.isLoadRecord = payload.isLoadRecord
    },
    setCurrentTab(state, payload) {
      payload.window.currentTabUuid = payload.tabUuid
    }
  },
  actions: {
    getWindowFromServer: ({ commit, dispatch }, windowUuid) => {
      return new Promise((resolve, reject) => {
        getWindowMetadata(windowUuid)
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
            const firstTab = tabs[0].getTablename()
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
                containerUuid: tabItem.getUuid(),
                parentUuid: windowUuid,
                windowUuid: windowUuid,
                name: tabItem.getName(),
                tabGroup: group,
                sequence: tabItem.getSequence(),
                tabLevel: tabItem.getTablevel(),
                displayLogic: tabItem.getDisplaylogic(),
                isView: tabItem.getIsview(),
                isDocument: tabItem.getIsdocument(),
                // TODO: Verify the value to return, the value is always false, and new records cannot be created
                isInsertRecord: true, // tabItem.getIsinsertrecord(),
                isSortTab: tabItem.getIssorttab(), // Tab type Order Tab
                isParentTab: Boolean(firstTab === tabItem.getTablename()),
                contextInfo: convertContextInfoFromGRPC(tabItem.getContextinfo()),
                isAdvancedTab: tabItem.getIsadvancedtab(),
                isHasTree: tabItem.getIshastree(),
                isInfoTab: tabItem.getIsinfotab(),
                isTranslationTab: tabItem.getIstranslationtab(),
                isReadOnly: tabItem.getIsreadonly(),
                isDeleteable: tabItem.getIsdeleteable(),
                accessLevel: tabItem.getAccesslevel(),
                isSingleRow: tabItem.getIssinglerow(),
                // conditionals
                linkColumnName: tabItem.getLinkcolumnname(),
                parentColumnName: tabItem.getParentcolumnname(),
                commitWarning: tabItem.getCommitwarning(),
                // query db
                tableName: tabItem.getTablename(),
                query: tabItem.getQuery(),
                whereClause: tabItem.getWhereclause(),
                orderByClause: tabItem.getOrderbyclause(),
                isLoadRecord: false,
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
              const processList = tabItem.getProcessesList().map(processItem => {
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
              dispatch('setContextMenu', {
                containerUuid: tab.uuid,
                relations: [],
                actions: actions,
                references: []
              })

              if (tab.isParentTab) {
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
              isShowedDetail: Boolean(childrenTabs.length),
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
        getTabMetadata(objectParams.containerUuid)
          .then(response => {
            const panelType = objectParams.panelType
            var fieldsList = response.getFieldsList()
            var additionalAttributes = {
              parentUuid: objectParams.parentUuid,
              containerUuid: objectParams.containerUuid,
              isShowedFromUser: true,
              panelType: panelType,
              //
              isReadOnlyFromForm: false,
              isAvancedQuery: objectParams.isAvancedQuery
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
              panelType: panelType,
              isAvancedQuery: objectParams.isAvancedQuery,
              windowQuery: objectParams.windowQuery
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
    changeTabIsLoadRecord: ({ commit, getters }, parameters) => {
      const tab = getters.getTab(parameters.parentUuid, parameters.containerUuid)
      commit('changeTabIsLoadRecord', {
        tab: tab,
        isLoadRecord: parameters.isLoadRecord
      })
    },
    /**
     * @param {string} parameters.parentUuid
     * @param {string} parameters.containerUuid
     */
    setCurrentTab: ({ commit, getters }, parameters) => {
      commit('setCurrentTab', {
        window: getters.getWindow(parameters.parentUuid),
        tabUuid: parameters.containerUuid
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
    },
    getCurrentTab: (state, getters) => (windowUuid) => {
      const window = getters.getWindow(windowUuid)
      if (window) {
        return window.tabsList.find(tabItem => {
          return tabItem.uuid === window.currentTabUuid
        })
      }
      return window
    },
    getTabIsLoadRecord: (state, getters) => (windowUuid, tabUuid) => {
      const tab = getters.getTab(windowUuid, tabUuid)
      if (tab) {
        return tab.isLoadRecord
      }
      return tab
    }
  }
}

export default window
