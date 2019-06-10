// Vuex file for store all related to panel and fields
// Use it for handle events for changes and put context, also can be
// used for hadle isDisplayed logic, read only logic and mandatory logic
// The scope is use panel as storage of:
// - Window: Just need storage tab and fields
// - Process & Report: Always save a panel and parameters
// - Smart Browser: Can have a search panel, table panel and process panel
import evaluator from '@/utils/ADempiere/evaluator.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtil.js'

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
    },
    changeFieldShowedFromUser(state, payload) {
      state = state.panel.map(item => {
        if (payload.containerUuid === item.containerUuid) {
          return payload.newPanel
        }
        return item
      })
    },
    changeFieldValue(state, payload) {
      payload.field.oldValue = payload.field.value
      payload.field.value = payload.newValue
      payload.field.valueTo = payload.valueTo
    }
  },
  actions: {
    addPanel({ commit }, params) {
      var keyColumn = ''
      var selectionColumn = []

      params.fieldList.forEach((itemField) => {
        if (itemField.isKey) {
          keyColumn = itemField.columnName
        }
        if (itemField.isSelectionColumn) {
          selectionColumn.push(itemField.columnName)
        }
      })

      params.keyColumn = keyColumn
      params.selectionColumn = selectionColumn
      commit('addPanel', params)
    },
    addFields({ commit }, payload) {
      commit('addFields', payload)
    },
    changeFieldShowedFromUser({ commit, dispatch, getters }, params) {
      var panel = getters.getPanel(params.containerUuid)
      var newFields = panel.fieldList.map((itemField) => {
        if (params.fieldsUser.length > 0 && params.fieldsUser.indexOf(itemField.columnName) !== -1) {
          itemField.isShowedFromUser = true
          return itemField
        }
        itemField.isShowedFromUser = false
        return itemField
      })
      panel.fieldList = newFields
      commit('changeFieldShowedFromUser', {
        containerUuid: params.containerUuid,
        newPanel: panel
      })
      // Updated record result
      if (panel.panelType === 'browser') {
        dispatch('getBrowserSearch', panel.uuid)
      }
    },
    notifyPanelChange({ state, dispatch }, payload) {
      state.panel
        .find(item => item.uuid === payload.containerUuid).fieldList
        .filter(field => field.dependentFieldsList !== undefined)
        .forEach((actionField) => {
          dispatch('notifyFieldChange', {
            parentUuid: payload.parentUuid,
            containerUuid: payload.containerUuid,
            columnName: actionField.columnName,
            newValue: actionField.value
          })
        })
    },
    notifyFieldChange({ commit, state, dispatch, getters }, payload) {
      //  Call context management
      commit('setContext', {
        ...payload,
        value: payload.newValue
      })
      var panel = state.panel.find(panelItem => panelItem.uuid === payload.containerUuid)
      var fieldList = panel.fieldList
      var field = fieldList.find(fieldItem => fieldItem.columnName === payload.columnName)
      commit('changeFieldValue', {
        field: field,
        newValue: payload.newValue,
        valueTo: payload.valueTo
      })
      //  Change Dependents
      var dependents = fieldList.filter(fieldItem => {
        return field.dependentFieldsList.includes(fieldItem.columnName)
      })
      //  Iterate for change logic
      dependents.forEach((dependent) => {
        //  isDisplayed Logic
        var isDisplayedFromLogic = false
        var isMandatoryFromLogic = false
        var isReadOnlyFromLogic = false
        if (dependent.displayLogic.trim() !== '') {
          isDisplayedFromLogic = evaluator.evaluateLogic({
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
          isMandatoryFromLogic = evaluator.evaluateLogic({
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
          isReadOnlyFromLogic = evaluator.evaluateLogic({
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
      if (panel.panelType === 'browser') {
        dispatch('getBrowserSearch', payload.containerUuid)
      }
    },
    getPanelAndFields({ dispatch }, payload) {
      if (payload.type === 'process' || payload.type === 'report') {
        return dispatch('getProcessFromServer', payload.containerUuid)
          .then(response => {
            if (response) {
              return response
            }
          })
      } else if (payload.type === 'browser') {
        return dispatch('getBrowserFromServer', payload.containerUuid)
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
    getFieldsListFromPanel: (state, getters) => (containerUuid) => {
      var panel = getters.getPanel(containerUuid)
      if (typeof panel === 'undefined') {
        return []
      }
      return panel.fieldList
    },
    getFieldFromColumnName: (state, getters) => (columnName, containerUuid) => {
      var fieldList = getters.getFieldsListFromPanel(containerUuid)
      return fieldList.find(field => field.columnName === columnName)
    },
    getFieldFromUuid: (state, getters) => (uuid, containerUuid) => {
      var fieldList = getters.getFieldsListFromPanel(containerUuid)
      return fieldList.find(field => field.uuid === uuid)
    },
    getChangedFieldsList: (state) => (containerUuid) => {
      var panel = state.panel.find(
        itemPanel => itemPanel.uuid === containerUuid
      )

      if (typeof panel === 'undefined') {
        return panel
      }
      var fieldList = panel.fieldList.filter((itemField) => {
        return !isEmptyValue(itemField.value)
      })

      // fields with not empty value
      return fieldList
    },
    /**
     * get field list visible and with values
     */
    getPanelParameters: (state, getters) => (containerUuid, isEvaluateEmptyDisplayed = false) => {
      const fieldList = getters.getFieldsListFromPanel(containerUuid)
      const fields = fieldList.length
      var params = []
      var isEmptyFieldDisplayed = false // indicate if exists a field displayed and empty value

      if (fields > 0) {
        params = fieldList
          .filter(fieldItem => {
            const isMandatory = fieldItem.isMandatory && fieldItem.isMandatoryFromLogic
            const isDisplayed = fieldItem.isActive && fieldItem.isDisplayed && fieldItem.isDisplayedFromLogic && (fieldItem.isShowedFromUser || isMandatory)
            if (!isEmptyValue(fieldItem.value) && isDisplayed) {
              return true
            }
            // empty value
            if (isMandatory && isEvaluateEmptyDisplayed) {
              isEmptyFieldDisplayed = true
            }
            return false
          })

        if (isEvaluateEmptyDisplayed && isEmptyFieldDisplayed) {
          return {
            fields: fields,
            params: []
          }
        }
      }
      return {
        fields: fields,
        params: params
      }
    }
  }
}

export default panel
