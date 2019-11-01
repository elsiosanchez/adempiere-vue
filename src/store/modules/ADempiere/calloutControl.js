import { runCallOutRequest } from '@/api/ADempiere/data'
import { convertValuesMapToObject } from '@/utils/ADempiere'

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
          dispatch('notifyPanelChange', {
            containerUuid: parameters.containerUuid,
            panelType: 'window',
            newValues: values,
            isSendToServer: false
          })
          console.log('response callout', values)
        })
        .catch(error => {
          console.error('error callout', error, parameters)
        })
    }
  }
}

export default callOutControl
