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
      if (payload.isChangedOldValue) {
        payload.field.oldValue = payload.newValue
      } else {
        payload.field.oldValue = payload.field.value
      }
      payload.field.value = payload.newValue
      payload.field.valueTo = payload.valueTo
      payload.field.displayColumn = payload.displayColumn
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

        if (!(params.panelType === 'table' || params.isAvancedQuery)) {
          // TODO: Evaluate if send context when is children tab
          dispatch('setContext', {
            parentUuid: params.parentUuid,
            containerUuid: params.uuid,
            columnName: itemField.columnName,
            value: itemField.value
          })
        }
      })

      params.keyColumn = keyColumn
      params.selectionColumn = selectionColumn
      params.recordUuid = null
      if (params.isAvancedQuery) {
        params.fieldList = assignedGroup(params.fieldList.filter(field => params.selectionColumn.includes(field.columnName)))
      } else {
        params.fieldList = assignedGroup(params.fieldList)
      }

      commit('addPanel', params)
    },
    // used by components/fields/filterFields
    changeFieldShowedFromUser({ commit, dispatch, getters }, params) {
      var panel = getters.getPanel(params.containerUuid, params.isAvancedQuery)
      var showsFieldsWithValue = false
      var hiddenFieldsWithValue = false
      var newFields = panel.fieldList.map(itemField => {
        const isMandatory = itemField.isMandatory || itemField.isMandatoryFromLogic
        if (!isMandatory && fieldIsDisplayed(itemField)) {
          if (itemField.groupAssigned === params.groupField) {
            if (params.fieldsUser.length && params.fieldsUser.includes(itemField.columnName)) {
              // if it isShowedFromUser it is false, and it has some value, it means
              // that it is going to show, therefore the SmartBrowser must be searched
              if (!isEmptyValue(itemField.value) && !itemField.isShowedFromUser) {
                showsFieldsWithValue = true
              }
              if (params.isAvancedQuery) {
                itemField.isShowedFromUser = false
              }
              itemField.isShowedFromUser = true
              return itemField
            }
            // if it isShowedFromUser it is true, and it has some value, it means
            // that it is going to hidden, therefore the SmartBrowser must be searched
            if (!isEmptyValue(itemField.value) && itemField.isShowedFromUser) {
              hiddenFieldsWithValue = true
            }
            if (params.isAvancedQuery) {
              itemField.isShowedFromUser = false
            }
            itemField.isShowedFromUser = false
          }
        } else {
          if (itemField.groupAssigned === params.groupField) {
            if (params.fieldsUser.length && params.fieldsUser.includes(itemField.columnName)) {
              // if it isShowedFromUser it is false, and it has some value, it means
              // that it is going to show, therefore the SmartBrowser must be searched
              if (!isEmptyValue(itemField.value) && !itemField.isShowedFromUser) {
                showsFieldsWithValue = true
              }
              if (params.isAvancedQuery) {
                itemField.isShowedFromUser = false
              }
              itemField.isShowedFromUser = true
              return itemField
            }
            if (!isEmptyValue(itemField.value) && itemField.isShowedFromUser) {
              hiddenFieldsWithValue = true
            }
            if (params.isAvancedQuery) {
              itemField.isShowedFromUser = false
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
          .catch(error => {
            console.warn(error)
          })
      }
    },
    /**
     * Change some attribute boolean from fields in panel
     * @param {string}  params.containerUuid
     * @param {string}  params.attribute
     * @param {boolean} params.valueAttribute
     * @param {array}   params.fieldsIncludes
     * @param {array}   params.fieldsExcludes
     */
    changeFieldAttributesBoolean({ commit, getters }, params) {
      var panel = getters.getPanel(params.containerUuid)
      var newFields = panel.fieldList.map(itemField => {
        // var oldValue = itemField[params.attribute]

        // not change exlude field
        if (params.fieldsExcludes && params.fieldsExcludes.length && params.fieldsExcludes.includes(itemField.columnName)) {
          return itemField
        }
        // if it field is included to change value
        if (params.fieldsIncludes.length && params.fieldsIncludes.includes(itemField.columnName)) {
          itemField[params.attribute] = params.valueAttribute
          return itemField
        }
        // changed current value by opposite set value
        itemField[params.attribute] = !params.valueAttribute
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
     * @param {object} parameters.fieldList, field list of panel
     * @param {object} parameters.newValues, values to set in panel
     * @param {object} parameters.isDontSendToEdit, indicate if changes not send to server
     */
    notifyPanelChange({ dispatch, getters }, parameters) {
      var fieldList = []
      if (parameters.fieldList && parameters.fieldList.length) {
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
            displayColumn: parameters.newValues['DisplayColumn_' + actionField.columnName],
            newValue: parameters.newValues[actionField.columnName],
            fieldList: fieldList,
            field: actionField,
            isChangedOldValue: true // defines if set oldValue with newValue instead of current value
          })
        }
      })
    },
    /**
     * @param {string} params.parentUuid
     * @param {string} params.containerUuid
     * @param {string} params.columnName
     * @param {string} params.newValue
     * @param {string} params.panelType
     * @param {string} params.isAvancedQuery
     */
    notifyFieldChange({ commit, dispatch, getters }, params) {
      var panel
      if (params.isAvancedQuery) {
        panel = getters.getPanel(params.containerUuid, params.isAvancedQuery)
      } else {
        panel = getters.getPanel(params.containerUuid)
      }
      var fieldList = panel.fieldList
      var field = field = fieldList.find(fieldItem => fieldItem.columnName === params.columnName)

      // the field has not changed, then the action is broken
      if (params.newValue === field.value) {
        return
      }

      if (field.componentPath === 'FieldDate') {
        if (typeof params.newValue === 'number') {
          params.newValue = new Date(params.newValue)
        }
        if (typeof params.valueTo === 'number') {
          params.valueTo = new Date(params.valueTo)
        }
      } else if (field.componentPath === 'FieldNumber') {
        if (params.newValue === undefined || params.newValue === '') {
          params.newValue = null
        } else {
          params.newValue = Number(params.newValue)
        }
      } else if (field.componentPath === 'FieldText' || field.componentPath === 'FieldTextArea') {
        if (params.newValue === undefined || params.newValue === null) {
          params.newValue = null
        } else {
          params.newValue = String(params.newValue)
        }
      }

      if (!(params.panelType === 'table' || params.isAvancedQuery)) {
        //  Call context management
        dispatch('setContext', {
          parentUuid: params.parentUuid,
          containerUuid: params.containerUuid,
          columnName: params.columnName,
          value: params.newValue
        })
      }

      commit('changeFieldValue', {
        field: field,
        newValue: params.newValue,
        valueTo: params.valueTo,
        displayColumn: params.displayColumn,
        isChangedOldValue: params.isChangedOldValue
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
        if (!getters.isNotReadyForSubmit(params.containerUuid)) {
          if (field.panelType === 'browser' && fieldIsDisplayed(field)) {
            dispatch('getBrowserSearch', {
              containerUuid: params.containerUuid,
              clearSelection: true
            })
              .catch(error => {
                console.warn(error)
              })
          }
          if (field.panelType === 'window' && fieldIsDisplayed(field)) {
            var uuid = getters.getUuid(params.containerUuid)
            if (isEmptyValue(uuid)) {
              dispatch('createNewEntity', {
                containerUuid: params.containerUuid
              })
                .then(response => {
                  // change old value so that it is not send in the next update
                  commit('changeFieldValue', {
                    field: field,
                    newValue: params.newValue,
                    valueTo: params.valueTo,
                    displayColumn: params.displayColumn,
                    isChangedOldValue: true
                  })

                  var oldRoute = router.app._route
                  router.push({
                    name: oldRoute.name,
                    query: {
                      action: response.recordUuid,
                      tabNumber: oldRoute.query.tabNumber
                    }
                  })
                  dispatch('tagsView/delView', oldRoute, true)
                })
                .catch(error => {
                  console.warn('Create Entity Error ' + error.code + ': ' + error.message)
                })
            } else {
              dispatch('updateCurrentEntity', {
                containerUuid: params.containerUuid,
                recordUuid: uuid
              })
                .then(response => {
                  // change old value so that it is not send in the next update
                  commit('changeFieldValue', {
                    field: field,
                    newValue: params.newValue,
                    valueTo: params.valueTo,
                    displayColumn: params.displayColumn,
                    isChangedOldValue: true
                  })

                  // change value in table
                  dispatch('notifyRowTableChange', {
                    containerUuid: params.containerUuid,
                    row: response,
                    isEdit: false
                  })
                })
                .catch(error => {
                  console.warn('Update Entity Error ' + error.code + ': ' + error.message)
                })
            }
          }
        }
      } else if (!params.isDontSendToQuery) {
        if (params.panelType === 'table' && fieldIsDisplayed(field)) {
          var value = field.value
          if (typeof value === 'boolean') {
            value = value ? 'Y' : 'N'
          }
          var avancedQueryParameters = { tableName: '', whereClause: '', query: '' }
          avancedQueryParameters.tableName = panel.tableName
          avancedQueryParameters.whereClause = `${panel.tableName}.${field.columnName} LIKE '%${value}%'`
          avancedQueryParameters.query = panel.windowQuery
          if (panel.isAvancedQuery) {
            dispatch('getObjectListFromCriteria', {
              containerUuid: panel.uuid,
              tableName: avancedQueryParameters.tableName,
              query: avancedQueryParameters.query,
              whereClause: avancedQueryParameters.whereClause
            })
          }
        }
      }
    },
    notifyFieldChangeDisplayColumn({ commit, getters }, parameters) {
      var field = getters.getFieldFromColumnName(parameters.containerUuid, parameters.columnName)
      var newField = {
        field: field,
        newValue: field.value,
        valueTo: field.valueTo,
        displayColumn: parameters.displayColumn
      }
      commit('changeFieldValue', newField)
    },
    getPanelAndFields({ dispatch }, parameters) {
      if (parameters.type === 'process' || parameters.type === 'report') {
        return dispatch('getProcessFromServer', parameters.containerUuid)
          .then(response => {
            return response
          })
          .catch(error => {
            return {
              ...error,
              moreInfo: `Dictionary getPanelAndFields ${parameters.type} (State Panel)`,
              parameters: parameters
            }
          })
      } else if (parameters.type === 'browser') {
        return dispatch('getBrowserFromServer', parameters.containerUuid)
          .then(response => {
            return response
          })
          .catch(error => {
            return {
              ...error,
              moreInfo: 'Dictionary getPanelAndFields browser (State Panel)',
              parameters: parameters
            }
          })
      } else if (parameters.type === 'window' || parameters.type === 'table') {
        return dispatch('getTabAndFieldFromServer', {
          parentUuid: parameters.parentUuid,
          containerUuid: parameters.containerUuid,
          isAvancedQuery: parameters.isAvancedQuery,
          panelType: parameters.type,
          windowQuery: parameters.windowQuery
        }).then(response => {
          return response
        }).catch(error => {
          return {
            ...error,
            moreInfo: 'Dictionary getPanelAndFields Window (State Panel)',
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
    getPanel: (state) => (containerUuid, isAvancedQuery = false) => {
      return state.panel.find(item => {
        return item.uuid === containerUuid && (!isAvancedQuery || (isAvancedQuery && item.isAvancedQuery))
      })
    },
    getFieldsListFromPanel: (state, getters) => (containerUuid, isAvancedQuery = false) => {
      var panel = getters.getPanel(containerUuid, isAvancedQuery)
      if (panel === undefined) {
        return []
      }
      return panel.fieldList
    },
    getFieldFromColumnName: (state, getters) => (containerUuid, columnName) => {
      return getters.getFieldsListFromPanel(containerUuid).find(itemField => itemField.columnName === columnName)
    },
    /**
     * Determinate if panel is ready fron send, all fiedls mandatory and displayed with values
     * @param {string}  containerUuid
     * @returns {boolean}
     */
    isNotReadyForSubmit: (state, getters) => (containerUuid) => {
      const field = getters.getFieldsListFromPanel(containerUuid).find(fieldItem => {
        const isMandatory = fieldItem.isMandatory || fieldItem.isMandatoryFromLogic
        if (fieldIsDisplayed(fieldItem) && isMandatory && isEmptyValue(fieldItem.value)) {
          return true
        }
      })

      return field
    },
    /**
     * @param {string}  containerUuid
     * @param {object} dataRow, values
     */
    isReadyForSubmitRowTable: (state, getters) => (containerUuid, dataRow) => {
      const field = getters.getFieldsListFromPanel(containerUuid).find(fieldItem => {
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
        if ((itemField.isMandatory || itemField.isMandatoryFromLogic) && isEmptyValue(itemField.value)) {
          return true
        }
      })
    },
    // all available fields not mandatory to show, used in components panel/filterFields.vue
    getFieldsListNotMandatory: (state, getters) => (containerUuid, evaluateShowed = true) => {
      // all optionals (not mandatory) fields
      return getters.getFieldsListFromPanel(containerUuid).filter(fieldItem => {
        const isMandatory = fieldItem.isMandatory || fieldItem.isMandatoryFromLogic
        if (!isMandatory) {
          const isDisplayed = fieldIsDisplayed(fieldItem)
          if (evaluateShowed) {
            return isDisplayed
          }
          return !isMandatory
        }
      })
    },
    getUuid: (state, getters) => (containerUuid) => {
      const fieldUuid = getters.getColumnNamesAndValues({
        containerUuid: containerUuid,
        propertyName: 'value',
        isObjectReturn: true,
        isAddDisplayColumn: true
      })

      if (fieldUuid) {
        return fieldUuid.UUID
      }
      return undefined
    },
    /**
     * @param {string}  containerUuid, unique identifier of the panel to search your list of fields
     * @param {string}  propertyName, property name to return its value (value, oldValue and parsedDefaultValue)
     * @param {boolean} isObjectReturn, define if is an object to return, else arraylist return
     * @param {boolean} isEvaluateValues, define if evaluate emty values
     * @param {boolean} isAddDisplayColumn, define if return display columns
     * @param {boolean} isAddRangeColumn, define if return rangue columns_To
     * @param {array} withOut, define if return display columns
     * @param {array} isEvaluatedChangedValue, define if return only fields with values changes
     * @returns {array|object}
     */
    getColumnNamesAndValues: (state, getters) => ({
      containerUuid,
      propertyName = 'value',
      isObjectReturn = false,
      isEvaluateValues = false,
      isAddDisplayColumn = false,
      isAddRangeColumn = false,
      withOut = [],
      isEvaluatedChangedValue = false
    }) => {
      var attributesList = getters.getFieldsListFromPanel(containerUuid)
      var attributesObject = {}
      var displayColumnsList = []
      var rangeColumnsList = []

      if (withOut.length || isEvaluatedChangedValue) {
        attributesList = attributesList.filter(fieldItem => {
          // columns to exclude
          if (withOut.includes(fieldItem.columnName)) {
            return false
          }
          if (isEvaluatedChangedValue && fieldItem.value === fieldItem.oldValue) {
            return false
          }
          return true
        })
      }

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

          // Add display columns
          if (fieldItem.displayColumn) {
            attributesObject['DisplayColumn_' + fieldItem.columnName] = fieldItem.displayColumn
            displayColumnsList.push({
              columnName: 'DisplayColumn_' + fieldItem.columnName,
              value: fieldItem.displayColumn
            })
          }

          // add range columns
          if (isAddRangeColumn && fieldItem.isRange) {
            attributesObject[fieldItem.columnName + '_To'] = fieldItem.valueTo
            rangeColumnsList.push({
              columnName: fieldItem.columnName + '_To',
              value: fieldItem.valueTo
            })
          }

          return {
            columnName: fieldItem.columnName,
            value: valueToReturn
          }
        })

      if (isAddDisplayColumn) {
        attributesList = attributesList.concat(displayColumnsList, rangeColumnsList)
      }

      if (isObjectReturn) {
        return attributesObject
      }
      return attributesList
    },
    getFieldsIsDisplayed: (state, getters) => (containerUuid) => {
      const fieldList = getters.getFieldsListFromPanel(containerUuid)
      var fieldsIsDisplayed = []
      var fieldsNotDisplayed = []
      if (fieldList.length) {
        fieldsIsDisplayed = fieldList.filter(itemField => {
          const isMandatory = itemField.isMandatory && itemField.isMandatoryFromLogic
          if (fieldIsDisplayed(itemField) && (isMandatory || itemField.isShowedFromUser)) {
            return true
          }
          fieldsNotDisplayed.push(itemField)
        })
      }
      return {
        fieldIsDisplayed: fieldsIsDisplayed,
        fieldsNotDisplayed: fieldsNotDisplayed,
        totalField: fieldList.length,
        isDisplayed: Boolean(fieldsIsDisplayed.length)
      }
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

          const isMandatory = Boolean(fieldItem.isMandatory || fieldItem.isMandatoryFromLogic)
          const isDisplayed = fieldIsDisplayed(fieldItem) && (fieldItem.isShowedFromUser || isMandatory)

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
      const fieldList = getters.getPanelParameters(containerUuid, true, withOut)
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
    },
    getParametersToServer: (state, getters) => ({
      containerUuid,
      withOutColumnNames = [],
      isEvaluateDisplayed = true
    }) => {
      const fieldList = getters.getFieldsListFromPanel(containerUuid)
      var parametersRange = []

      // filter fields
      var parametersList = fieldList
        .filter(fieldItem => {
          // columns to exclude
          if (withOutColumnNames.includes(fieldItem.columnName)) {
            return false
          }

          const isMandatory = Boolean(fieldItem.isMandatory || fieldItem.isMandatoryFromLogic)
          // mandatory fields
          if (isMandatory) {
            return true
          }

          // evaluate displayed fields
          if (isEvaluateDisplayed) {
            const isDisplayed = fieldIsDisplayed(fieldItem) && (fieldItem.isShowedFromUser || isMandatory)
            if (isDisplayed && !isEmptyValue(fieldItem.value)) {
              return true
            }
          }

          return false
        })

      // conever parameters
      parametersList = parametersList
        .map(parameterItem => {
          // TODO: Evaluate if is only to fields type Time Date, DateTime
          if (parameterItem.isRange) {
            parametersRange.push({
              columnName: parameterItem.columnName + '_To',
              value: parameterItem.valueTo
            })
          }

          return {
            columnName: parameterItem.columnName,
            value: parameterItem.value
          }
        })

      parametersList = parametersList.concat(parametersRange)
      return parametersList
    }
  }
}

export default panel
