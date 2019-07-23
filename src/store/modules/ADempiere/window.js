import { getWindow as gettingWindow, getTab } from '@/api/ADempiere/dictionary'
import { convertContextInfoFromGRPC, convertFieldFromGRPC } from '@/utils/ADempiere'

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
    setCurrentTab(state, payload) {
      payload.window.currentTabUuid = payload.tabUuid
    }
  },
  actions: {
    getWindowFromServer: ({ commit, dispatch }, windowUuid) => {
      return new Promise((resolve, reject) => {
        gettingWindow(windowUuid)
          .then(response => {
            var newWindow = {
              id: response.getId(),
              uuid: windowUuid,
              name: response.getName(),
              contextInfo: convertContextInfoFromGRPC(response.getContextinfo())
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
                // conditionals
                linkColumnName: tabItem.getLinkcolumnname(),
                parentColumnName: tabItem.getParentcolumnname(),
                commitWarning: tabItem.getCommitwarning(),
                query: tabItem.getQuery(),
                whereClause: tabItem.getWhereclause(),
                orderByClause: tabItem.getOrderbyclause()
              }

              //  Convert from gRPC process list
              var actions = tabItem.getProcessesList().map(processItem => {
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
          .catch(err => {
            console.warn('Dictionary Window (State Window) - Error ' + err.code + ': ' + err.message)
            reject(err)
          })
      })
    },
    getTabAndFieldFromServer: ({ commit, dispatch }, objectParams) => {
      return new Promise((resolve, reject) => {
        getTab(objectParams.containerUuid)
          .then(response => {
            var panelType = 'window'
            var fieldsList = response.getFieldsList()
            var additionalAttributes = {
              parentUuid: objectParams.parentUuid,
              containerUuid: objectParams.containerUuid,
              isShowedFromUser: true,
              panelType: panelType
            }

            //  Convert from gRPC
            fieldsList = fieldsList.map((item, index) => {
              item = convertFieldFromGRPC(item, {
                ...additionalAttributes,
                fieldListIndex: index
              })
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
          .catch(err => {
            console.warn('Dictionary Tab (State Window) - Error ' + err.code + ': ' + err.message)
            reject(err)
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
    /**
     * @param {string} params.parentUuid
     * @param {string} params.containerUuid
     */
    setCurrentTab: ({ commit, state }, params) => {
      var window = state.window.find(item => item.uuid === params.parentUuid)
      commit('setCurrentTab', {
        window: window,
        tabUuid: params.containerUuid
      })
    }
  },
  getters: {
    getWindow: (state) => (windowUuid) => {
      var window = state.window.find(
        item => item.uuid === windowUuid
      )
      return window
    },
    getTabsList: (state, getters) => (windowUuid, tabUuid = null) => {
      var window = getters.getWindow(windowUuid)
      if (window) {
        if (tabUuid) {
          var tab = window.tabsList.find(
            tabItem => tabItem.uuid === tabUuid
          )
          return tab
        }
        return window.tabsListParent
      }
      return window
    },
    getTab: (state, getters) => (windowUuid, tabUuid) => {
      var window = getters.getWindow(windowUuid)
      if (window) {
        var tab = window.tabsList.find(tabItem => {
          return tabItem.uuid === tabUuid
        })
        return tab
      }
      return window
    },
    getTabProcess: (state, getters) => (windowUuid, tabUuid) => {
      var tab = getters.getTab(windowUuid, tabUuid)
      if (tab) {
        return tab.processList
      }
      return tab
    },
    getCurrentTab: (state, getters) => (windowUuid) => {
      var window = getters.getWindow(windowUuid)
      if (window) {
        return window.currentTab
      }
      return window
    }
  }
}

export default window
