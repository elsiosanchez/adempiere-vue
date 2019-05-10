// Store used for set all related to context menu
// for Window, Process, Smart Browser andother customized component
// See structure:
// menu: [
//   {
//     containerUuid: '',
//     relations: [],
//     actions: [],
//     references: []
//   }
// ]
const contextMenu = {
  state: {
    reportFormat: '',
    menu: [],
    currentContextMenuUuid: ''
  },
  mutations: {
    setMenu(state, payload) {
      state.menu.push(payload)
    },
    setRelations(state, payload) {
      state.menu.find(
        item => item.containerUuid === payload.containerUuid
      ).relations = payload.relations
    },
    setActions(state, payload) {
      state.menu.find(
        item => item.containerUuid === payload.containerUuid
      ).actions = payload.actions
    },
    setReferences(state, payload) {
      state.menu.find(
        item => item.containerUuid === payload.containerUuid
      ).references = payload.references
    },
    reloadContextMenu(state, payload) {
      state.currentContextMenuUuid = payload.containerUuid
    },
    openReport(state, payload) {
      state.reportFormat = payload
    }
  },
  actions: {
    setMenu({ commit }, payload) {
      commit('setMenu', payload)
    },
    setRelations({ commit }, payload) {
      commit('setRelations', payload)
    },
    setActions({ commit }, payload) {
      commit('setActions', payload)
    },
    setReferences({ commit }, payload) {
      commit('setReferences', payload)
    },
    reloadContextMenu({ commit }, payload) {
      commit('reloadContextMenu', payload)
    },
    openReport({ commit }, reportExportType) {
      commit('openReport', reportExportType)
    }
  },
  getters: {
    getMenu: (state) => (containerUuid) => {
      var menu = state.menu.find(
        item => item.containerUuid === containerUuid
      )
      if (menu === undefined) {
        return menu
      }
      return menu
    },
    getRelations: (state, getters, rootState) => (containerUuid) => {
      var menu = rootState.permission.addRoutes.find(
        item => item.name === containerUuid
      )
      if (menu === undefined) {
        return menu
      }
      return menu.children
    },
    getActions: (state) => (containerUuid) => {
      var menu = state.menu.find(
        item => item.containerUuid === containerUuid
      )
      if (menu === undefined) {
        return menu
      }
      return menu.actions
    },
    getReferences: (state) => (containerUuid) => {
      var menu = state.menu.find(
        item => item.containerUuid === containerUuid
      )
      if (menu === undefined) {
        return menu
      }
      return menu.references
    }
  }
}

export default contextMenu
