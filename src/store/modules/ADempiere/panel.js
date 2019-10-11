// Vuex file for store all related to panel and fields
// Use it for handle events for changes and put context, also can be
// used for hadle isDisplayed logic, read only logic and mandatory logic
// The scope is use panel as storage of:
// - Window: Just need storage tab and fields
// - Process & Report: Always save a panel and parameters
// - Smart Browser: Can have a search panel, table panel and process panel
import evaluator, { assignedGroup, fieldIsDisplayed, isEmptyValue, parsedValueComponent, showMessage } from '@/utils/ADempiere'
import router from '@/router'
import language from '@/lang'

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

        if (!(params.panelType === 'table' || params.isAdvancedQuery)) {
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
      params.fieldList = assignedGroup(params.fieldList)

      commit('addPanel', params)
    },
    // used by components/fields/filterFields
    changeFieldShowedFromUser({ commit, dispatch, getters }, params) {
      var panel = getters.getPanel(params.containerUuid, params.isAdvancedQuery)
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
              if (params.isAdvancedQuery) {
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
            if (params.isAdvancedQuery) {
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
              if (params.isAdvancedQuery) {
                itemField.isShowedFromUser = false
              }
              itemField.isShowedFromUser = true
              return itemField
            }
            if (!isEmptyValue(itemField.value) && itemField.isShowedFromUser) {
              hiddenFieldsWithValue = true
            }
            if (params.isAdvancedQuery) {
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
          isClearSelection: true
        })
          .catch(error => {
            console.warn(error)
          })
      }
    },
    /**
     * Change some attribute boolean from fields in panel
     * @param {string}  containerUuid
     * @param {string}  attribute
     * @param {boolean} valueAttribute
     * @param {array}   fieldsIncludes fields to set valueAttribute
     * @param {array}   fieldsExcludes fields to dont change
     */
    changeFieldAttributesBoolean({ commit, getters }, parameters) {
      var panel = getters.getPanel(parameters.containerUuid)
      var newFields = panel.fieldList.map(itemField => {
        // not change exlude field
        if (parameters.fieldsExcludes && parameters.fieldsExcludes.length && parameters.fieldsExcludes.includes(itemField.columnName)) {
          return itemField
        }
        // if it field is included to change value
        if (parameters.fieldsIncludes && parameters.fieldsIncludes.length && parameters.fieldsIncludes.includes(itemField.columnName)) {
          itemField[parameters.attribute] = parameters.valueAttribute
          return itemField
        }
        // changed current value by opposite set value
        itemField[parameters.attribute] = !parameters.valueAttribute
        return itemField
      })
      panel.fieldList = newFields
      commit('changePanel', {
        containerUuid: parameters.containerUuid,
        newPanel: panel
      })
    },
    /**
     * Changed panel when receive or reset panel to new record
     * @param {string} parentUuid
     * @param {string} containerUuid
     * @param {object} fieldList, field list of panel
     * @param {object} newValues, values to set in panel
     * @param {boolean} isDontSendToEdit, indicate if changes not send to server
     */
    notifyPanelChange({ dispatch, getters }, {
      parentUuid,
      containerUuid,
      fieldList = [],
      newValues = {},
      isDontSendToEdit = false, // TODO: change to isSendToServer with default value in true,
      isShowedField = false
    }) {
      if (!fieldList.length) {
        fieldList = getters.getFieldsListFromPanel(containerUuid)
      }
      var fieldsShowed = []

      fieldList.forEach(actionField => {
        if (actionField.isShowedFromUser) {
          fieldsShowed.push(actionField.columnName)
        }

        // Evaluate with hasOwnProperty if exits this value
        if (!newValues.hasOwnProperty(actionField.columnName)) {
          return
        }
        if (newValues[actionField.columnName] !== actionField.value) {
          dispatch('notifyFieldChange', {
            isDontSendToEdit: isDontSendToEdit,
            parentUuid: parentUuid,
            containerUuid: containerUuid,
            columnName: actionField.columnName,
            displayColumn: newValues['DisplayColumn_' + actionField.columnName],
            newValue: newValues[actionField.columnName],
            valueTo: newValues[actionField.columnName + '_To'],
            fieldList: fieldList,
            field: actionField,
            isChangedOldValue: true // defines if set oldValue with newValue instead of current value
          })
        }
      })
      if (isShowedField && Object.keys(newValues).length) {
        // join column names without duplicating it
        fieldsShowed = Array.from(new Set([
          ...fieldsShowed,
          ...Object.keys(newValues)
        ]))

        dispatch('changeFieldAttributesBoolean', {
          parentUuid: parentUuid,
          containerUuid: containerUuid,
          attribute: 'isShowedFromUser',
          valueAttribute: true,
          fieldsIncludes: fieldsShowed
        })
      }
    },
    /**
     * @param {string} params.parentUuid
     * @param {string} params.containerUuid
     * @param {string} params.columnName
     * @param {string} params.newValue
     * @param {string} params.panelType
     * @param {string} isDontSendToEdit // TODO: change to isSendToServer with default value in true,
     * @param {string} params.isAdvancedQuery // TODO: Rename to isAdvancedQuery
     */
    notifyFieldChange({ commit, dispatch, getters }, params) {
      var panel
      if (params.isAdvancedQuery) {
        panel = getters.getPanel(params.containerUuid, params.isAdvancedQuery)
      } else {
        panel = getters.getPanel(params.containerUuid)
      }
      var fieldList = panel.fieldList
      var field = field = fieldList.find(fieldItem => fieldItem.columnName === params.columnName)
      params.newValue = parsedValueComponent({
        fieldType: field.componentPath,
        referenceType: field.referenceType,
        value: params.newValue
      })

      if (field.isRange) {
        params.valueTo = parsedValueComponent({
          fieldType: field.componentPath,
          referenceType: field.referenceType,
          value: params.valueTo
        })
      }

      // the field has not changed, then the action is broken
      if (params.newValue === field.value) {
        return
      }

      if (!(params.panelType === 'table' || params.isAdvancedQuery)) {
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
        // TODO: refactory for it and change for a standard metho
        if (!getters.isNotReadyForSubmit(params.containerUuid)) {
          if (field.panelType === 'browser' && fieldIsDisplayed(field)) {
            dispatch('getBrowserSearch', {
              containerUuid: params.containerUuid,
              isClearSelection: true
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
                  showMessage({
                    message: error.message,
                    type: 'error'
                  })
                  console.warn('Create Entity Error ' + error.code + ': ' + error.message)
                })
            } else {
              dispatch('updateCurrentEntity', {
                containerUuid: params.containerUuid,
                recordUuid: uuid
              })
                .then(response => {
                  // change old value so that it is not send in the next update
                  showMessage({
                    message: language.t('notifications.updateFields') + field.name,
                    type: 'success'
                  })
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
                  showMessage({
                    message: error.message,
                    type: 'error'
                  })
                  console.warn('Update Entity Error ' + error.code + ': ' + error.message)
                })
            }
          }
        } else {
          showMessage({
            message: language.t('notifications.mandatoryFieldMissing') + getters.getisMandatoryfieldmissing(params.containerUuid),
            type: 'info'
          })
        }
      } else if (!params.isDontSendToQuery) {
        if (params.panelType === 'table' && fieldIsDisplayed(field)) {
          if (panel.isAdvancedQuery) {
            dispatch('getObjectListFromCriteria', {
              containerUuid: panel.uuid,
              tableName: panel.tableName,
              query: panel.query,
              whereClause: panel.whereClause,
              conditions: getters.getParametersToServer({
                containerUuid: params.containerUuid,
                isAdvancedQuery: true,
                isEvaluateMandatory: false
              })
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
          isAdvancedQuery: parameters.isAdvancedQuery,
          panelType: parameters.type
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
    getPanel: (state) => (containerUuid, isAdvancedQuery = false) => {
      return state.panel.find(item => {
        return item.uuid === containerUuid && (!isAdvancedQuery || (isAdvancedQuery && item.isAdvancedQuery))
      })
    },
    getFieldsListFromPanel: (state, getters) => (containerUuid, isAdvancedQuery = false) => {
      const panel = getters.getPanel(containerUuid, isAdvancedQuery)
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
    //
    getisMandatoryfieldmissing: (state, getters) => (containerUuid, evaluateShowed = true) => {
      // all optionals (not mandatory) fields
      var isMandatoryField = getters.getFieldsListFromPanel(containerUuid).filter(fieldItem => {
        const isMandatory = fieldItem.isMandatory || fieldItem.isMandatoryFromLogic
        if (isMandatory) {
          const isDisplayed = fieldIsDisplayed(fieldItem)
          if (evaluateShowed) {
            return isDisplayed
          }
          return isMandatory
        }
      })
      var isMandatoryEmptyField = isMandatoryField.filter(fieldItem => {
        if (isEmptyValue(fieldItem.value)) {
          return fieldItem.name
        }
      })
      return isMandatoryEmptyField.map(fieldItem => {
        return fieldItem.name
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

      // TODO: Evaluate valueTo
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
    getParametersToShare: (state, getters) => ({
      containerUuid,
      withOut = [],
      isOnlyDisplayed = false,
      isAdvancedQuery = false
    }) => {
      var fieldList = getters.getFieldsListFromPanel(containerUuid, isAdvancedQuery)
      var attributesListLink = ''
      if (withOut.length) {
        fieldList = fieldList.filter(fieldItem => {
          // columns to exclude
          if (withOut.includes(fieldItem.columnName)) {
            return false
          }
          return true
        })
      }

      if (isOnlyDisplayed) {
        fieldList = fieldList.filter(fieldItem => {
          const isMandatory = Boolean(fieldItem.isMandatory || fieldItem.isMandatoryFromLogic)
          const isDisplayed = fieldIsDisplayed(fieldItem) && (fieldItem.isShowedFromUser || isMandatory)

          if (isDisplayed) {
            return true
          }
          return false
        })
      }

      fieldList.map(fieldItem => {
        // assign values
        var value = fieldItem.value
        var valueTo = fieldItem.valueTo

        if (!isEmptyValue(value)) {
          if (['FieldDate', 'FieldTime'].includes(fieldItem.componentPath)) {
            value = value.getTime()
          }
          attributesListLink += `${fieldItem.columnName}=${encodeURIComponent(value)}&`
        }

        if (fieldItem.isRange && !isEmptyValue(valueTo)) {
          if (['FieldDate', 'FieldTime'].includes(fieldItem.componentPath)) {
            valueTo = valueTo.getTime()
          }
          attributesListLink += `${fieldItem.columnName}_To=${encodeURIComponent(valueTo)}&`
        }
      })

      return attributesListLink.slice(0, -1)
    },
    /**
     * get field list visible and with values
     */
    getPanelParameters: (state, getters) => (containerUuid, isEvaluateEmptyDisplayed = false, withOut = [], isAdvancedQuery) => {
      if (isAdvancedQuery) {
        var panel = getters.getPanel(containerUuid, isAdvancedQuery)
      } else {
        panel = getters.getPanel(containerUuid)
      }
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
     * [{ columname: name key, value: value to send } ]
     */
    getParametersToServer: (state, getters) => ({
      containerUuid,
      withOutColumnNames = [],
      isEvaluateDisplayed = true,
      isEvaluateMandatory = true,
      isConvertedDateToTimestamp = false,
      isAdvancedQuery = false
    }) => {
      const fieldList = getters.getFieldsListFromPanel(containerUuid, isAdvancedQuery)
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
          if (isEvaluateMandatory && isMandatory) {
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
          var value = parameterItem.value
          var valueTo = parameterItem.valueTo

          if (isConvertedDateToTimestamp) {
            if (['FieldDate', 'FieldTime'].includes(parameterItem.componentPath)) {
              value = parameterItem.value.getTime()
              if (valueTo) {
                valueTo = parameterItem.valueTo.getTime()
              }
            }
          }
          // TODO: Evaluate if is only to fields type Time Date, DateTime
          if (parameterItem.isRange) {
            parametersRange.push({
              columnName: parameterItem.columnName + '_To',
              value: valueTo
            })
          }

          return {
            columnName: parameterItem.columnName,
            value: value
          }
        })

      parametersList = parametersList.concat(parametersRange)
      return parametersList
    }
  }
}

export default panel
