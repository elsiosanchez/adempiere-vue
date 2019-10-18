import { getBrowserSearch } from '@/api/ADempiere/data'
import { convertValuesMapToObject, isEmptyValue, parseContext, showMessage } from '@/utils/ADempiere'
import language from '@/lang'

const browserControl = {
  actions: {
    /**
     * Search with query criteria
     * @param {string}  containerUuid, browser to search record data
     * @param {boolean} isClearSelection, clear selection after search
     */
    getBrowserSearch({ dispatch, rootGetters }, parameters) {
      const { containerUuid, isClearSelection = false } = parameters
      showMessage({
        title: language.t('notifications.loading'),
        message: language.t('notifications.searching'),
        type: 'info'
      })
      const allData = rootGetters.getDataRecordAndSelection(containerUuid)
      // deletes the data from the container to replace it and to report the searches in the table
      dispatch('deleteRecordContainer', {
        viewUuid: containerUuid
      })

      const browser = rootGetters.getBrowser(containerUuid)
      // parameters isQueryCriteria
      const finalParameters = rootGetters.getParametersToServer({
        containerUuid: containerUuid,
        fieldList: browser.fieldList
      })

      const parsedQuery = parseContext({
        containerUuid: containerUuid,
        value: browser.query
      })

      var parsedWhereClause
      if (!isEmptyValue(browser.whereClause)) {
        parsedWhereClause = parseContext({
          containerUuid: containerUuid,
          value: browser.whereClause
        })
      }

      var nextPageToken
      if (!isEmptyValue(allData.nextPageToken)) {
        nextPageToken = allData.nextPageToken + '-' + allData.pageNumber
      }

      // Add validation compare browserSearchQueryParameters
      return getBrowserSearch({
        uuid: containerUuid,
        query: parsedQuery,
        whereClause: parsedWhereClause,
        orderByClause: browser.orderByClause,
        parameters: finalParameters,
        nextPageToken: nextPageToken
      })
        .then(response => {
          const recordList = response.getRecordsList()
          const record = recordList.map(itemRecord => {
            var values = convertValuesMapToObject(itemRecord.getValuesMap())

            // datatables attribute
            values.isEdit = false
            values.isSelected = false
            return values
          })

          var selection = allData.selection
          if (isClearSelection) {
            selection = []
          }

          var token = response.getNextPageToken()
          if (token !== undefined) {
            token = token.slice(0, -2)
          }

          dispatch('setRecordSelection', {
            containerUuid: containerUuid,
            record: record,
            pageNumber: rootGetters.getPageNumber(containerUuid),
            selection: selection,
            recordCount: response.getRecordcount(),
            nextPageToken: token
          })
          showMessage({
            title: language.t('notifications.succesful'),
            message: language.t('notifications.succcessSearch'),
            type: 'success'
          })
          return record
        })
        .catch(error => {
          showMessage({
            title: language.t('notifications.error'),
            message: language.t('notifications.errorSearch'),
            type: 'error'
          })
          console.warn('Error getting browser search: ' + error.message + '. Code: ' + error.code)
        })
    }
  }
}

export default browserControl
