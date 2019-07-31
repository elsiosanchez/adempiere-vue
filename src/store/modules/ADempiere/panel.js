// Vuex file for store all related to panel and fields
// Use it for handle events for changes and put context, also can be
// used for hadle isDisplayed logic, read only logic and mandatory logic
// The scope is use panel as storage of:
// - Window: Just need storage tab and fields
// - Process & Report: Always save a panel and parameters
// - Smart Browser: Can have a search panel, table panel and process panel
import evaluator, { assignedGroup, fieldIsDisplayed, isEmptyValue } from '@/utils/ADempiere'

const panel = {
  state: {
    panel: []
  },
  mutations: {
    addPanel(state, payload) {
      console.log(state)
      state.panel.push(payload)
    },
    addFields(state, payload) {
      state.panel.find(
        item => item.uuid === payload.containerUuid
      ).fieldList = payload.fieldList
    },
    changeFieldLogic(state, payload) {
      if (payload.isDisplayedFromLogic !== undefined) {
        payload.field.isDisplayedFromLogic = payload.isDisplayedFromLogic
      }
      if (payload.isMandatoryFromLogic !== undefined) {
        payload.field.isMandatoryFromLogic = payload.isMandatoryFromLogic
      }
      if (payload.isReportFromLogic !== undefined) {
        payload.field.isReportFromLogic = payload.isReportFromLogic
      }
    },
    dictionaryResetCache(state, payload) {
      state.panel = payload
    },
    changePanel(state, payload) {
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
    addPanel({ commit, dispatch }, params) {
      var keyColumn = ''
      var selectionColumn = []

      params.fieldList.forEach(itemField => {
        if (itemField.isKey) {
          keyColumn = itemField.columnName
        }
        if (itemField.isSelectionColumn) {
          selectionColumn.push(itemField.columnName)
        }

        dispatch('setContext', {
          parentUuid: params.parentUuid,
          containerUuid: params.uuid,
          columnName: itemField.columnName,
          value: itemField.value
        })
      })

      params.keyColumn = keyColumn
      params.selectionColumn = selectionColumn
      params.recordUuid = null
      params.fieldList = assignedGroup(params.fieldList)
      console.log(params)
      commit('addPanel', params)
    },
    addFields({ commit }, params) {
      commit('addFields', params)
    },
    // REFACTORY ACTION WITH isReadyForSubmit
    changeFieldShowedFromUser({ commit, dispatch, getters }, params) {
      var panel = getters.getPanel(params.containerUuid)
      var showsFieldsWithValue = false
      var hiddenFieldsWithValue = false
      var newFields = panel.fieldList.map(itemField => {
        if (params.fieldsUser.length > 0 && params.fieldsUser.indexOf(itemField.columnName) !== -1) {
          // if it isShowedFromUser it is false, and it has some value, it means
          // that it is going to show, therefore the SmartBrowser must be searched
          if (!isEmptyValue(itemField.value) && !itemField.isShowedFromUser) {
            showsFieldsWithValue = true
          }
          itemField.isShowedFromUser = true
          return itemField
        }
        // if it isShowedFromUser it is true, and it has some value, it means
        // that it is going to hidden, therefore the SmartBrowser must be searched
        if (!isEmptyValue(itemField.value) && itemField.isShowedFromUser) {
          hiddenFieldsWithValue = true
        }
        itemField.isShowedFromUser = false
        return itemField
      })
      panel.fieldList = newFields
      commit('changePanel', {
        containerUuid: params.containerUuid,
        newPanel: panel
      })
      // Updated record result
      if (panel.panelType === 'browser' && (showsFieldsWithValue || hiddenFieldsWithValue)) {
        dispatch('getBrowserSearch', {
          containerUuid: panel.uuid,
          clearSelection: true
        })
      }
    },
    changeFieldAttributesBoolean({ commit, getters }, params) {
      var panel = getters.getPanel(params.containerUuid)
      var newFields = panel.fieldList.map(itemField => {
        if (params.fieldsUser.length > 0 && params.fieldsUser.indexOf(itemField.columnName) !== -1) {
          itemField[params.attribute] = params.valueAttrbute
          return itemField
        }
        itemField[params.attribute] = !params.valueAttrbute
        return itemField
      })
      panel.fieldList = newFields
      commit('changePanel', {
        containerUuid: params.containerUuid,
        newPanel: panel
      })
    },
    notifyPanelChange({ state, dispatch }, params) {
      state.panel
        .find(item => item.uuid === params.containerUuid).fieldList
        .filter(field => field.dependentFieldsList !== undefined)
        .forEach(actionField => {
          dispatch('notifyFieldChange', {
            parentUuid: params.parentUuid,
            containerUuid: params.containerUuid,
            columnName: actionField.columnName,
            newValue: actionField.value
          })
        })
    },
    notifyFieldChange({ commit, state, dispatch, getters }, params) {
      //  Call context management
      dispatch('setContext', {
        ...params,
        value: params.newValue
      })
      var panel = state.panel.find(panelItem => panelItem.uuid === params.containerUuid)
      var fieldList = panel.fieldList
      var field = fieldList.find(fieldItem => fieldItem.columnName === params.columnName)
      commit('changeFieldValue', {
        field: field,
        newValue: params.newValue,
        valueTo: params.valueTo
      })
      //  Change Dependents
      var dependents = fieldList.filter(fieldItem => {
        return field.dependentFieldsList.includes(fieldItem.columnName)
      })
      //  Iterate for change logic
      dependents.forEach(dependent => {
        //  isDisplayed Logic
        var isDisplayedFromLogic = false
        var isMandatoryFromLogic = false
        var isReadOnlyFromLogic = false
        if (dependent.displayLogic.trim() !== '') {
          isDisplayedFromLogic = evaluator.evaluateLogic({
            context: getters,
            parentUuid: params.parentUuid,
            containerUuid: params.containerUuid,
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
            parentUuid: params.parentUuid,
            containerUuid: params.containerUuid,
            logic: dependent.mandatoryLogic
          })
        } else {
          isReadOnlyFromLogic = undefined
        }
        //  Read Only Logic
        if (dependent.readOnlyLogic.trim() !== '') {
          isReadOnlyFromLogic = evaluator.evaluateLogic({
            context: getters,
            parentUuid: params.parentUuid,
            containerUuid: params.containerUuid,
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
      // TODO: refactory for it and change for a standard method
      if (fieldIsDisplayed(field) && getters.isReadyForSubmit(params.containerUuid)) {
        if (panel.panelType === 'browser' && fieldIsDisplayed(field)) {
          dispatch('getBrowserSearch', {
            containerUuid: params.containerUuid,
            clearSelection: true
          })
        }
        console.log('Epale')
        if (panel.panelType === 'window' && fieldIsDisplayed(field)) {
          var uuid = getters.getUuid(params.containerUuid)
          console.log(uuid)
          if (isEmptyValue(uuid)) {
            dispatch('createNewEntity', {
              containerUuid: params.containerUuid
            })
          } else {
            dispatch('updateCurrentEntity', {
              containerUuid: params.containerUuid,
              recordUuid: uuid
            })
          }
        }
      }
    },
    getPanelAndFields({ dispatch }, params) {
      if (params.type === 'process' || params.type === 'report') {
        return dispatch('getProcessFromServer', params.containerUuid)
          .then(response => {
            if (response) {
              return response
            }
          })
      } else if (params.type === 'browser') {
        return dispatch('getBrowserFromServer', params.containerUuid)
          .then(response => {
            if (response) {
              return response
            }
          })
      } else if (params.type === 'window') {
        return dispatch('getTabAndFieldFromServer', {
          parentUuid: params.parentUuid,
          containerUuid: params.containerUuid
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
      if (panel === undefined) {
        return []
      }
      return panel.fieldList
    },
    /**
     * @param {string}  containerUuid
     * @param {boolean} evaluateShowed, indicate if evaluate showed fields
     */
    isReadyForSubmit: (state, getters) => (containerUuid, evaluateShowed = true) => {
      var field = getters.getFieldsListFromPanel(containerUuid).find(fieldItem => {
        const isMandatory = fieldItem.isMandatory || fieldItem.isMandatoryFromLogic
        if (isMandatory && isEmptyValue(fieldItem.value)) {
          return true
        }
      })
      var isReady = true
      if (field !== undefined) {
        isReady = false
      }
      return isReady
    },
    getEmptyMandatory: (state, getters) => (containerUuid) => {
      return getters.getPanel(containerUuid).find(itemField => {
        if (itemField.isMandatory && itemField.isMandatoryFromLogic && isEmptyValue(itemField.value)) {
          return true
        }
      })
    },
    // all available fields not mandatory to show, used in component panel/filterFields.vue
    getFieldsListNotMandatory: (state, getters) => (containerUuid, panelType, groupField) => {
      var fieldListSelected = []
      var fieldListOptional = getters.getFieldsListFromPanel(containerUuid).filter(fieldItem => {
        var isMandatory = fieldItem.isMandatory || fieldItem.isMandatoryFromLogic
        if (!isMandatory && groupField === fieldItem.groupAssigned) {
          var isBrowserDisplayed = panelType === 'browser' && fieldItem.isQueryCriteria // browser query criteria
          var isWindowDisplayed = panelType !== 'browser' && fieldItem.isDisplayed && fieldItem.isDisplayedFromLogic // window, process and report, browser result
          var isDisplayed = fieldItem.isActive && (isBrowserDisplayed || isWindowDisplayed) // Available fields to show

          if (isDisplayed && fieldItem.isShowedFromUser) {
            // showed displayed in view
            fieldListSelected.push(fieldItem.columnName)
          }
          return isDisplayed
        }
      })
      return {
        fieldListOptional: fieldListOptional,
        fieldListSelected: fieldListSelected
      }
    },
    getUuid: (state, getters) => (containerUuid) => {
      var uuid = getters.getColumnNamesAndValues(containerUuid).find(field => field.columnName === 'UUID')
      if (uuid !== undefined) {
        return uuid.value
      }
      return undefined
    },
    getColumnNamesAndValues: (state, getters) => (containerUuid) => {
      var fieldList = getters.getFieldsListFromPanel(containerUuid)
      var attributes = []
      attributes = fieldList.map(fieldItem => {
        return {
          columnName: fieldItem.columnName,
          value: fieldItem.value
        }
      })
      return attributes
    },
    /**
     * get field list visible and with values
     */
    getPanelParameters: (state, getters) => (containerUuid, isEvaluateEmptyDisplayed = false, withOut = []) => {
      const panel = getters.getPanel(containerUuid)
      const fieldList = panel.fieldList
      const fields = fieldList.length
      var params = []
      var fieldsMandatory = []
      var isEmptyFieldDisplayed = false // indicate if exists a field displayed and empty value

      if (fields > 0) {
        params = fieldList.filter(fieldItem => {
          // columns to exclude
          if (withOut.find(subitem => subitem.toLowerCase() === fieldItem.columnName.toLowerCase())) {
            return false
          }

          var isBrowserDisplayed = fieldItem.isQueryCriteria // browser query criteria
          var isWindowDisplayed = fieldItem.isDisplayed && fieldItem.isDisplayedFromLogic // window, process and report, browser result
          var isDisplayedView = (panel.panelType === 'browser' && isBrowserDisplayed) || (panel.panelType !== 'browser' && isWindowDisplayed)

          const isMandatory = fieldItem.isMandatory && fieldItem.isMandatoryFromLogic
          const isDisplayed = fieldItem.isActive && isDisplayedView && (fieldItem.isShowedFromUser || isMandatory)
          // mandatory fields
          if (isMandatory) {
            fieldsMandatory.push(fieldItem)
          }
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
            params: [],
            fieldsMandatory: fieldsMandatory
          }
        }
      }
      return {
        fields: fields,
        params: params,
        fieldsMandatory: fieldsMandatory
      }
    },
    /**
     * Getter converter selection params with value format
     * [
     *    { columname, value },
     *    { columname, value },
     *    { columname, value },
     *    { columname, value }
     * ]
     */
    getParamsProcessToServer: (state, getters) => (containerUuid, withOut = []) => {
      var fieldList = getters.getPanelParameters(containerUuid, true, withOut)
      var parameters = []
      if (fieldList.fields > 0) {
        var fieldListRange = []
        parameters = fieldList.params.map(fieldItem => {
          if (fieldItem.isRange) {
            fieldListRange.push({
              columnName: fieldItem.columnName + '_To',
              value: fieldItem.valueTo
            })
          }
          return {
            columnName: fieldItem.columnName,
            value: fieldItem.value
          }
        })
        parameters = parameters.concat(fieldListRange)
      }
      return {
        params: parameters,
        fields: fieldList.fields,
        fieldsMandatory: fieldList.fieldsMandatory
      }
    }
  }
}

export default panel
