import { getWindow as gettingWindow, getTab } from '@/api/ADempiere/dictionary'
import { convertContextInfoFromGRPC, convertFieldFromGRPC } from '@/utils/ADempiere'

const window = {
  state: {
    window: [],
    recordSelected: {}
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
    },
    setRecordSelected(state, payload) {
      state.recordSelected = payload
    }
  },
  actions: {
    getWindowFromServer: ({ commit, dispatch }, windowUuid) => {
      return new Promise((resolve, reject) => {
        gettingWindow(windowUuid)
          .then(response => {
            var tabs = response.getTabsList()
            var firstTab = tabs[0].getTablename()
            var allTabs = []
            var childrenTabs = []
            var parentTabs = []

            tabs.map((tabItem) => {
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
                linkColumnName: tabItem.getLinkcolumnname(),
                sequence: tabItem.getSequence(),
                tabLevel: tabItem.getTablevel(),
                isSortTab: tabItem.getIssorttab(), // Tab type Order Tab
                parentColumnName: tabItem.getParentcolumnname(),
                parentTab: Boolean(firstTab === tabItem.getTablename()),
                contextInfo: convertContextInfoFromGRPC(tabItem.getContextinfo())
              }

              //  Convert from gRPC process list
              var actions = tabItem.getProcessesList().map((processItem) => {
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
                dispatch('getObjectListFromCriteria', {
                  containerUuid: tab.uuid,
                  table: tab.tableName,
                  criteria: "IsActive = 'Y'"
                })
              }
              allTabs.push(tab)
            })

            var newWindow = {
              id: response.getId(),
              uuid: windowUuid,
              name: response.getName(),
              tabsList: allTabs,
              currentTab: parentTabs[0],
              tabsListParent: parentTabs,
              tabsListChildren: childrenTabs,
              contextInfo: convertContextInfoFromGRPC(response.getContextinfo()),
              // app attributes
              isShowedDetail: Boolean(childrenTabs.length > 0),
              currentTabUuid: parentTabs[0].uuid
            }
            dispatch('getObjectListFromCriteria', {
              containerUuid: newWindow.currentTab.windowUuid,
              table: newWindow.currentTab.tableName,
              criteria: "uuid <> ''"
            })
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
    },
    setRecordSelected: ({ commit }, object) => {
      if (typeof object !== 'undefined') {
        commit('setRecordSelected', object)
      }
    }
  },
  getters: {
    getWindow: (state) => (windowUuid) => {
      var window = state.window.find(
        item => item.uuid === windowUuid
      )
      return window
    },
    getTabsList: (state) => (windowUuid, tabUuid = null) => {
      var window = state.window.find(
        item => item.uuid === windowUuid
      )
      if (typeof window === 'undefined') {
        return window
      }
      if (tabUuid) {
        var tab = window.allTabs.find(
          tabItem => tabItem.uuid === tabUuid
        )
        return tab
      }
      return window.tabsListParent
    },
    getTabProcess: (state) => (windowUuid, tabUuid) => {
      var window = state.window.find(
        item => item.uuid === windowUuid
      )
      if (typeof window === 'undefined') {
        return window
      }
      var tab = window.tabsListParent.find(
        tabItem => tabItem.uuid === tabUuid
      )
      return tab.processList
    }
  }
}

export default window
