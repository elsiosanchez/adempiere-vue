import { runCallOutRequest } from '@/api/ADempiere/data'
import { convertValuesMapToObject, showMessage } from '@/utils/ADempiere'

const callOutControl = {
  actions: {
    getCallout({ rootGetters, dispatch }, parameters) {
      const finalParameters = rootGetters.getParametersToServer({
        containerUuid: parameters.containerUuid
      })

      return runCallOutRequest({
        windowUuid: parameters.parentUuid,
        tabUuid: parameters.containerUuid,
        tableName: parameters.tableName,
        columnName: parameters.columnName,
        value: parameters.value,
        callout: parameters.callout,
        attributesList: finalParameters
      })
        .then(response => {
          const values = convertValuesMapToObject(
            response.getValuesMap()
          )
          if (parameters.isTable) {
            dispatch('notifyRowTableChange', {
              parentUuid: parameters.parentUuid,
              containerUuid: parameters.containerUuid,
              row: values,
              isEdit: true
            })
          } else {
            dispatch('notifyPanelChange', {
              parentUuid: parameters.parentUuid,
              containerUuid: parameters.containerUuid,
              panelType: 'window',
              newValues: values,
              isSendToServer: false,
              withOutColumnNames: parameters.withOutColumnNames,
              isSendCallout: false
            })
          }
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'error'
          })
          console.warn('error callout', error, parameters)
        })
    }
  }
}

export default callOutControl
