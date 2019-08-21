// Vuex file for store all related to panel and fields
// Use it for handle events for changes and put context, also can be
// used for hadle isDisplayed logic, read only logic and mandatory logic
// The scope is use panel as storage of:
// - Window: Just need storage tab and fields
// - Process & Report: Always save a panel and parameters
// - Smart Browser: Can have a search panel, table panel and process panel
import evaluator, { assignedGroup, fieldIsDisplayed, isEmptyValue } from '@/utils/ADempiere'
import router from '@/router'

const panel = {
  state: {
    panel: []
  },
  mutations: {
    addPanel(state, payload) {
      state.panel.push(payload)
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
      commit('addPanel', params)
    },
    // used by components/fields/filterFields
    changeFieldShowedFromUser({ commit, dispatch, getters }, params) {
      var panel = getters.getPanel(params.containerUuid)
      var showsFieldsWithValue = false
      var hiddenFieldsWithValue = false
      var newFields = panel.fieldList.map(itemField => {
        const isMandatory = itemField.isMandatory || itemField.isMandatoryFromLogic
        if (!isMandatory && fieldIsDisplayed(itemField)) {
          if (itemField.groupAssigned === params.groupField) {
            if (params.fieldsUser.length > 0 &&
              params.fieldsUser.includes(itemField.columnName)) {
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
          }
        }
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
    /**
     * Changed panel when receive or reset panel to new record
     * @param {string} parameters.parentUuid
     * @param {string} parameters.containerUuid
     * @param {object} parameters.newValues
     */
    notifyPanelChange({ dispatch, getters }, parameters) {
      var fieldList = []
      if (parameters.fieldList && parameters.fieldList.length > 0) {
        fieldList = parameters.fieldList
      } else {
        fieldList = getters.getFieldsListFromPanel(parameters.containerUuid)
      }

      fieldList.forEach(actionField => {
        if (parameters.newValues[actionField.columnName] !== actionField.value) {
          dispatch('notifyFieldChange', {
            isDontSendToEdit: parameters.isDontSendToEdit,
            parentUuid: parameters.parentUuid,
            containerUuid: parameters.containerUuid,
            columnName: actionField.columnName,
            newValue: parameters.newValues[actionField.columnName],
            fieldList: fieldList,
            field: actionField
          })
        }
      })
    },
    notifyFieldChange({ commit, state, dispatch, getters }, params) {
      var panel = state.panel.find(panelItem => panelItem.uuid === params.containerUuid)
      var fieldList = panel.fieldList
      var field = field = fieldList.find(fieldItem => fieldItem.columnName === params.columnName)

      // the field has not changed, then the action is broken
      if (params.newValue === field.value) {
        return
      }

      if (field.componentPath === 'Date') {
        if (typeof params.newValue === 'number') {
          params.newValue = new Date(params.newValue)
        }
        if (typeof params.newValue === 'number') {
          params.valueTo = new Date(params.valueTo)
        }
      }

      //  Call context management
      dispatch('setContext', {
        ...params,
        value: params.newValue
      })
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
      if (!params.isDontSendToEdit) {
        // TODO: refactory for it and change for a standard method
        if (getters.isReadyForSubmit(params.containerUuid)) {
          if (field.panelType === 'browser' && fieldIsDisplayed(field)) {
            dispatch('getBrowserSearch', {
              containerUuid: params.containerUuid,
              clearSelection: true
            })
          }
          if (field.panelType === 'window' && fieldIsDisplayed(field)) {
            var uuid = getters.getUuid(params.containerUuid)
            if (isEmptyValue(uuid)) {
              dispatch('createNewEntity', {
                containerUuid: params.containerUuid
              })
                .then(response => {
                  var oldRoute = router.app._route
                  router.push({
                    name: oldRoute.name,
                    params: {
                      action: response.recordUuid
                    }
                  })
                  dispatch('tagsView/delView', oldRoute, true)
                })
                .catch(error => {
                  console.warn(error)
                })
            } else {
              dispatch('updateCurrentEntity', {
                containerUuid: params.containerUuid,
                recordUuid: uuid
              })
            }
          }
        }
      }
    },
    getPanelAndFields({ dispatch }, parameters) {
      if (parameters.type === 'process' || parameters.type === 'report') {
        return dispatch('getProcessFromServer', parameters.containerUuid)
          .then(response => {
            if (response) {
              return response
            }
          })
          .catch(error => {
            return error
          })
      } else if (parameters.type === 'browser') {
        return dispatch('getBrowserFromServer', parameters.containerUuid)
          .then(response => {
            if (response) {
              return response
            }
          })
          .catch(error => {
            return {
              ...error,
              moreInfo: 'Dictionary getTabAndFieldFromServer Window (State Panel)',
              parameters: parameters
            }
          })
      } else if (parameters.type === 'window') {
        return dispatch('getTabAndFieldFromServer', {
          parentUuid: parameters.parentUuid,
          containerUuid: parameters.containerUuid
        }).then(response => {
          if (response) {
            return response
          }
        }).catch(error => {
          return {
            ...error,
            moreInfo: 'Dictionary getTabAndFieldFromServer Window (State Panel)',
            parameters: parameters
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
    getFieldFromColumnName: (state, getters) => (containerUuid, columnName) => {
      return getters.getFieldsListFromPanel(containerUuid).find(itemField => itemField.columnName === columnName)
    },
    /**
     * @param {string}  containerUuid
     * @param {boolean} evaluateShowed, indicate if evaluate showed fields
     */
    isReadyForSubmit: (state, getters) => (containerUuid, evaluateShowed = true) => {
      var fieldList = getters.getFieldsListFromPanel(containerUuid)
      var field = fieldList.find(fieldItem => {
        const isMandatory = fieldItem.isMandatory || fieldItem.isMandatoryFromLogic
        if (fieldIsDisplayed(fieldItem) && isMandatory && isEmptyValue(fieldItem.value)) {
          return true
        }
      })

      return Boolean(!field)
    },
    /**
     * @param {string}  containerUuid
     * @param {object} dataRow, values
     */
    isReadyForSubmitRowTable: (state, getters) => (containerUuid, dataRow) => {
      var fieldList = getters.getFieldsListFromPanel(containerUuid)
      var field = fieldList.find(fieldItem => {
        const isMandatory = fieldItem.isMandatory || fieldItem.isMandatoryFromLogic
        const value = dataRow[fieldItem.columnName]
        if (fieldIsDisplayed(fieldItem) && isMandatory && isEmptyValue(value)) {
          return true
        }
      })

      return Boolean(!field)
    },
    getEmptyMandatory: (state, getters) => (containerUuid) => {
      return getters.getFieldsListFromPanel(containerUuid).find(itemField => {
        if (itemField.isMandatory && itemField.isMandatoryFromLogic && isEmptyValue(itemField.value)) {
          return true
        }
      })
    },
    // all available fields not mandatory to show, used in components panel/filterFields.vue
    getFieldsListNotMandatory: (state, getters) => (containerUuid, evaluateShowed = true) => {
      var fieldListOptional = getters.getFieldsListFromPanel(containerUuid).filter(fieldItem => {
        const isMandatory = fieldItem.isMandatory || fieldItem.isMandatoryFromLogic
        if (!isMandatory) {
          const isDisplayed = fieldIsDisplayed(fieldItem)
          if (evaluateShowed) {
            return isDisplayed
          }
          return !isMandatory
        }
      })
      return fieldListOptional // all optionals (not mandatory) fields
    },
    getUuid: (state, getters) => (containerUuid) => {
      var uuid = getters.getColumnNamesAndValues(containerUuid).find(field => field.columnName === 'UUID')
      if (uuid) {
        return uuid.value
      }
      return undefined
    },
    /**
     * @param {string}  containerUuid, unique identifier of the panel to search your list of fields
     * @param {string}  propertyName, property name to return its value (value, oldValue and parsedDefaultValue)
     * @param {boolean} isObjectReturn, define if is an object to return, else arraylist return
     * @param {boolean} isObjectReturn, define if evaluate emty values
     * @returns {array|object}
     */
    getColumnNamesAndValues: (state, getters) => (containerUuid, propertyName = 'value', isObjectReturn = false, isEvaluateValues = false) => {
      var fieldList = getters.getFieldsListFromPanel(containerUuid)
      var attributesList = fieldList
      var attributesObject = {}

      if (isEvaluateValues) {
        attributesList = attributesList
          .filter(fieldItem => {
            if (!isEmptyValue(fieldItem.value)) {
              return true
            }
            return false
          })
      }

      attributesList = attributesList
        .map(fieldItem => {
          const valueToReturn = fieldItem[propertyName]
          attributesObject[fieldItem.columnName] = valueToReturn

          return {
            columnName: fieldItem.columnName,
            value: valueToReturn
          }
        })
      if (isObjectReturn) {
        return attributesObject
      }
      return attributesList
    },
    getColumnNamesAndValuesChanged: (state, getters) => (containerUuid) => {
      var fieldListChanged = getters.getFieldsListFromPanel(containerUuid)
        .filter(fieldItem => {
          if (fieldItem.isMandatory || fieldItem.isMandatoryFromLogic) {
            return true
          }
          if (fieldItem.value !== fieldItem.oldValue &&
            !isEmptyValue(fieldItem.value) === !isEmptyValue(fieldItem.oldValue)) {
            return true
          }
        })
        .map(fieldItem => {
          return {
            columnName: fieldItem.columnName,
            value: fieldItem.value
          }
        })
      return fieldListChanged
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
          if (withOut.find(subItem => subItem === fieldItem.columnName)) {
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
    getParametersProcessToServer: (state, getters) => (containerUuid, withOut = []) => {
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
