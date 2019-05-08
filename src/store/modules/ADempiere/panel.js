// Vuex file for store all related to panel and fields
// Use it for handle events for changes and put context, also can be
// used for hadle display logic, read only logic and mandatory logic
// The scope is use panel as storage of:
// - Window: Just need storage tab and fields
// - Process & Report: Always save a panel and parameters
// - Smart Browser: Can have a search panel, table panel and process panel
// import { evaluator } from '@/utils/ADempiere/evaluator.js'
import Vue from 'vue'

const panel = {
  state: {
    panel: []
  },
  mutations: {
    addPanel(state, payload) {
      state.panel.push(payload)
    },
    addFields(state, payload) {
      state.panel.find(
        item => item.uuid === payload.containerUuid
      ).fieldList = payload.fieldList
    },
    changeFieldLogic(state, payload) {
      if (typeof payload.isDisplayedFromLogic !== 'undefined') {
        payload.field.isDisplayedFromLogic = payload.isDisplayedFromLogic
      }
      if (typeof payload.isMandatoryFromLogic !== 'undefined') {
        payload.field.isMandatoryFromLogic = payload.isMandatoryFromLogic
      }
      if (typeof payload.isReportFromLogic !== 'undefined') {
        payload.field.isReportFromLogic = payload.isReportFromLogic
      }
    },
    dictionaryResetCache(state, payload) {
      state.panel = payload
    }
  },
  actions: {
    addPanel({ commit }, payload) {
      commit('addPanel', payload)
    },
    addFields({ commit }, payload) {
      commit('addFields', payload)
    },
    notifyPanelChange({ state, dispatch }, payload) {
      state.panel
        .find(item => item.uuid === payload.containerUuid).fieldList
        .filter(field => field.dependentFieldsList !== undefined)
        .forEach(function(actionField) {
          dispatch('notifyFieldChange', {
            parentUuid: payload.parentUuid,
            containerUuid: payload.containerUuid,
            columnName: actionField.columnName,
            newValue: actionField.value
          })
        })
    },
    notifyFieldChange({ commit, state, getters }, payload) {
      //  Call context management
      commit('setContext', {
        ...payload,
        value: payload.newValue
      })
      var fieldList = state.panel
        .find(item => item.uuid === payload.containerUuid).fieldList
      var field = fieldList.find(field => field.columnName === payload.columnName)
      //  Change Dependents
      var dependents = fieldList.filter(function(item) {
        return field.dependentFieldsList.includes(item.columnName)
      })
      //  Iterate for change logic
      dependents.forEach(function(dependent) {
        //  Display Logic
        var isDisplayedFromLogic = false
        var isMandatoryFromLogic = false
        var isReadOnlyFromLogic = false
        if (dependent.displayLogic.trim() !== '') {
          isDisplayedFromLogic = Vue.prototype.$Evaluator.evaluateLogic({
            context: getters,
            parentUuid: payload.parentUuid,
            containerUuid: payload.containerUuid,
            logic: dependent.displayLogic,
            type: 'displayed'
          })
        } else {
          isDisplayedFromLogic = undefined
        }
        //  Mandatory Logic
        if (dependent.mandatoryLogic.trim() !== '') {
          isMandatoryFromLogic = Vue.prototype.$Evaluator.evaluateLogic({
            context: getters,
            parentUuid: payload.parentUuid,
            containerUuid: payload.containerUuid,
            logic: dependent.mandatoryLogic
          })
        } else {
          isReadOnlyFromLogic = undefined
        }
        //  Read Only Logic
        if (dependent.readOnlyLogic.trim() !== '') {
          isReadOnlyFromLogic = Vue.prototype.$Evaluator.evaluateLogic({
            context: getters,
            parentUuid: payload.parentUuid,
            containerUuid: payload.containerUuid,
            logic: dependent.readOnlyLogic
          })
        } else {
          isReadOnlyFromLogic = undefined
        }
        commit('changeFieldLogic', {
          field: dependent,
          isDisplayedFromLogic: isDisplayedFromLogic,
          isMandatoryFromLogic: isMandatoryFromLogic,
          isReadOnlyFromLogic: isReadOnlyFromLogic
        })
      })
    },
    getPanelAndFields({ dispatch }, payload) {
      if (payload.type === 'process' || payload.type === 'report') {
        return dispatch('getProcessFromServer', payload.containerUuid)
          .then(response => {
            if (response) {
              return response
            }
          })
      } else if (payload.type === 'window') {
        return dispatch('getTabAndFieldFromServer', {
          parentUuid: payload.parentUuid,
          containerUuid: payload.containerUuid
        }).then(response => {
          if (response) {
            return response
          }
        })
      } else if (payload.type === 'window') {
        return dispatch('getBrowserFromServer', payload.containerUuid)
          .then(response => {
            if (response) {
              return response
            }
          })
      }
    },
    dictionaryResetCache({ commit }, param = []) {
      commit('dictionaryResetCache', param)
      commit('dictionaryResetCacheWindow', param)
      commit('dictionaryResetCacheProcess', param)
      commit('dictionaryResetCacheBrowser', param)
    }
  },
  getters: {
    getPanel: (state) => (containerUuid) => {
      return state.panel.find(item => item.uuid === containerUuid)
    },
    getFieldsListFromPanel: (state) => (containerUuid) => {
      var panel = state.panel.find(
        item => item.uuid === containerUuid
      )
      if (typeof panel === 'undefined') {
        return panel
      }
      return panel.fieldList
    },
    getFieldFromColumnName: (state) => (columnName, containerUuid) => {
      var panel = state.panel.find(item => item.uuid === containerUuid)
      if (typeof panel === 'undefined') {
        return panel
      }
      return panel.fieldList.find(field => field.columnName === columnName)
    },
    getFieldFromUuid: (state) => (uuid, containerUuid) => {
      var panel = state.panel.find(item => item.uuid === containerUuid)
      if (typeof panel === 'undefined') {
        return panel
      }
      return panel.fieldList.find(field => field.uuid === uuid)
    }
  }
}

export default panel
