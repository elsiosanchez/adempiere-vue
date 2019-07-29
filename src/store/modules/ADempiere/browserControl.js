import { getBrowserSearch as getBrowserSearchFromData } from '@/api/ADempiere'
import { convertValueFromGRPC, parseContext, showMessage } from '@/utils/ADempiere'
import language from '@/lang'

const browserControl = {
  actions: {
    /**
     * Search with query criteria
     * @param {string} params.containerUuid, browser to search record data
     * @param {boolean} params.clearSelection, clear selection after search
     */
    getBrowserSearch({ commit, dispatch, rootGetters }, params) {
      return new Promise((resolve, reject) => {
        // parameters isQueryCriteria
        var finalParameters = rootGetters.getParamsProcessToServer(params.containerUuid)

        if ((finalParameters.fieldsMandatory.length > 0 &&
          finalParameters.params.length >= finalParameters.fieldsMandatory.length) ||
          finalParameters.fieldsMandatory.length === 0) {
          var browser = rootGetters.getBrowser(params.containerUuid)
          var parsedQuery = parseContext({
            parentUuid: params.containerUuid,
            containerUuid: params.containerUuid,
            value: browser.query
          })
          var parsedWhereClause = parseContext({
            parentUuid: params.containerUuid,
            containerUuid: params.containerUuid,
            value: browser.whereClause
          })

          var browserSearchQueryParameters = {
            uuid: params.containerUuid,
            query: parsedQuery,
            whereClause: parsedWhereClause,
            orderByClause: browser.orderByClause,
            parameters: finalParameters.params
          }
          // Add validation compare browserSearchQueryParameters
          getBrowserSearchFromData(browserSearchQueryParameters)
            .then(response => {
              const recordList = response.getRecordsList()
              var record = recordList.map(itemRecord => {
                const map = itemRecord.getValuesMap()
                var values = {}
                map.forEach((value, key) => {
                  values[key] = convertValueFromGRPC(value)
                })

                // datatables attribute
                values.isEdit = false
                values.isSelected = false
                return values
              })

              var selection = []
              if (!params.clearSelection) {
                selection = rootGetters.getDataRecordSelection(params.containerUuid)
              }
              var pageNumber = rootGetters.getPageCount(params.containerUuid)

              dispatch('recordSelection', {
                containerUuid: params.containerUuid,
                record: record,
                pageNumber: pageNumber,
                selection: selection
              })
              showMessage({
                title: language.t('notifications.succesful'),
                message: language.t('notifications.succcessSearch'),
                type: 'success'
              })
              resolve(record)
            })
            .catch(error => {
              showMessage({
                title: language.t('notifications.error'),
                message: language.t('notifications.errorSearch'),
                type: 'error'
              })
              reject(error)
            })
        }
      })
    }
  }
}

export default browserControl
