import { getWindow as gettingWindow, getTab } from '@/api/ADempiere/dictionary'
import { convertFieldFromGRPC } from '@/utils/ADempiere'

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
    }
  },
  actions: {
    getWindowFromServer: ({ commit }, windowUuid) => {
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
                parentColumnName: tabItem.getParentcolumnname(),
                parentTab: Boolean(firstTab === tabItem.getTablename())
              }
              if (tab.parentTab) {
                parentTabs.push(tab)
              } else {
                childrenTabs.push(tab)
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
              tabsListChildren: childrenTabs
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
    getTabAndFieldFromServer: ({ commit }, objectParams) => {
      return new Promise((resolve, reject) => {
        getTab(objectParams.containerUuid)
          .then(response => {
            var fieldsList = response.getFieldsList()
            var additionalAttributes = {
              parentUuid: objectParams.parentUuid,
              containerUuid: objectParams.containerUuid
            }

            //  Convert from gRPC
            fieldsList = fieldsList.map((item) => {
              item = convertFieldFromGRPC(item, additionalAttributes)
              return item
            })

            //  Get dependent fields
            fieldsList.filter(field => field.parentFieldsList && field.isActive)
              .forEach(function(field, index, list) {
                field.parentFieldsList.forEach(function(parentColumnName) {
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
              parentColumnName: response.getParentcolumnname()
            }
            //  Convert from gRPC process list
            var actions = response.getProcessesList().map((processItem) => {
              return {
                name: processItem.getName(),
                type: 'P',
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
              containerUuid: response.getUuid(),
              relations: [],
              actions: actions,
              references: []
            }
            commit('addPanel', panel)
            commit('setMenu', contextMenu)
            resolve(panel)
          })
          .catch(err => {
            console.warn('Dictionary Tab (State Window) - Error ' + err.code + ': ' + err.message)
            reject(err)
          })
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
