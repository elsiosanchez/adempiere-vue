import REFERENCES from '@/components/ADempiere/Field/references'
import evaluator from '@/utils/ADempiere/evaluator.js'

/**
 * Converted the gRPC value to the value needed
 * @param {mixed} initialValue Value get of gRPC
 */
export function convertValueFromGRPC(initialValue) {
  if (typeof initialValue === 'undefined') {
    return null
  }
  var returnValue = ''
  switch (initialValue.getValuetype()) {
    case 0:
      returnValue = initialValue.getIntvalue()
      break

    case 1:
      returnValue = initialValue.getLongvalue()
      break

    case 2:
      returnValue = initialValue.getDoublevalue()
      break

    case 3:
      returnValue = initialValue.getBooleanvalue()
      if (returnValue) {
        returnValue = 'Yes'
      } else {
        returnValue = 'No'
      }
      break

    case 4:
    case 5:
      returnValue = initialValue.getStringvalue()
      break
  }
  return returnValue
}

/**
 * Converted gRPC attributes to object
 * @param {object} fieldGRPC
 * @param {object} moreAttributes
 */
export function convertFieldFromGRPC(fieldGRPC, moreAttributes = {}) {
  var group = {}
  var isShowedFromUser = false
  try {
    group = {
      name: fieldGRPC.getFieldgroup().getName(),
      fieldGroupType: fieldGRPC.getFieldgroup().getFieldgrouptype()
    }
  } catch (e) {
    group = {
      name: '',
      fieldGroupType: ''
    }
  }

  if (moreAttributes.isShowedFromUser) {
    isShowedFromUser = moreAttributes.isShowedFromUser
  }

  var reference = fieldGRPC.getReference()
  var referenceValue
  var zoomWindowList
  if (reference) {
    if (reference.getWindowsList()) {
      zoomWindowList = reference.getWindowsList().map((zoomWindow) => {
        return {
          id: zoomWindow.getId(),
          uuid: zoomWindow.getUuid(),
          name: zoomWindow.getName(),
          description: zoomWindow.getDescription(),
          isSOTrx: zoomWindow.getIssotrx(),
          isActive: zoomWindow.getIsactive()
        }
      })
    }
    referenceValue = {
      tableName: reference.getTablename(),
      keyColumnName: reference.getKeycolumnname(),
      displayColumnName: reference.getDisplaycolumnname(),
      query: reference.getQuery(),
      parsedQuery: reference.getQuery(),
      directQuery: reference.getDirectquery(),
      parsedDirectQuery: reference.getDirectquery(),
      validationCode: reference.getValidationcode(),
      zoomWindowList: zoomWindowList
    }
  }

  var field = {
    ...moreAttributes,

    id: fieldGRPC.getId(),
    uuid: fieldGRPC.getUuid(),
    name: fieldGRPC.getName(),
    description: fieldGRPC.getDescription(),
    help: fieldGRPC.getHelp(),
    columnName: fieldGRPC.getColumnname(),

    fieldGroup: group,
    displayType: fieldGRPC.getDisplaytype(),
    componentPath: evalutateTypeField(fieldGRPC.getDisplaytype()),
    isFieldOnly: fieldGRPC.getIsfieldonly(),
    isSameLine: fieldGRPC.getIssameline(),
    sequence: fieldGRPC.getSequence(),
    seqNoGrid: fieldGRPC.getSeqnogrid(),
    isIdentifier: fieldGRPC.getIsidentifier(),
    isSelectionColumn: fieldGRPC.getIsselectioncolumn(),
    formatPattern: fieldGRPC.getFormatpattern(),
    VFormat: fieldGRPC.getVformat(),
    defaultValue: fieldGRPC.getDefaultvalue(),
    valueMin: fieldGRPC.getValuemin(),
    valueMax: fieldGRPC.getValuemax(),
    //
    isDisplayed: fieldGRPC.getIsdisplayed(),
    isActive: fieldGRPC.getIsactive(),
    isMandatory: fieldGRPC.getIsmandatory(),
    isReadOnly: fieldGRPC.getIsreadonly(),
    isDisplayedFromLogic: fieldGRPC.getIsdisplayed(),
    isReadOnlyFromLogic: fieldGRPC.getIsreadonly(),
    isMandatoryFromLogic: fieldGRPC.getIsmandatory(),
    //
    callout: fieldGRPC.getCallout(),
    isQueryCriteria: fieldGRPC.getIsquerycriteria(),
    displayLogic: fieldGRPC.getDisplaylogic(),
    mandatoryLogic: fieldGRPC.getMandatorylogic(),
    readOnlyLogic: fieldGRPC.getReadonlylogic(),
    parentFieldsList: getParentFields(fieldGRPC),
    dependentFieldsList: [],
    reference: referenceValue,
    // ADD SUPPORT IN SERVER
    isShowedFromUser: isShowedFromUser
  }
  return field
}

/**
 * Evaluate by the ID and name of the reference to call the component type
 * @param {integer} param, received from data
 * @return string type, assigned value to folder after evaluating the parameter
 */
export function evalutateTypeField(param) {
  var path = 'String'
  REFERENCES.forEach(reference => {
    if (param === reference.id || param === reference.type) {
      if (reference.support) {
        path = reference.type
        return
      }
    }
  })
  return path
}

export function getParentFields(fieldGRPC) {
  var parentFields = []
  //  For Display logic
  if (fieldGRPC.getDisplaylogic()) {
    Array.prototype.push.apply(parentFields, evaluator.parseDepends(fieldGRPC.getDisplaylogic()))
  }
  //  For Mandatory Logic
  if (fieldGRPC.getMandatorylogic()) {
    Array.prototype.push.apply(parentFields, evaluator.parseDepends(fieldGRPC.getMandatorylogic()))
  }
  //  For Read Only Logic
  if (fieldGRPC.getReadonlylogic()) {
    Array.prototype.push.apply(parentFields, evaluator.parseDepends(fieldGRPC.getReadonlylogic()))
  }
  //  For Default Value
  if (fieldGRPC.getDefaultvalue()) {
    Array.prototype.push.apply(parentFields, evaluator.parseDepends(fieldGRPC.getDefaultvalue()))
  }
  return parentFields
}
