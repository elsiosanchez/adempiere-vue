import { getBrowserSearch } from '@/api/ADempiere'
import { convertValuesMapToObject, isEmptyValue, parseContext, showMessage } from '@/utils/ADempiere'
import language from '@/lang'

const browserControl = {
  actions: {
    /**
     * Search with query criteria
     * @param {string}  parameters.containerUuid, browser to search record data
     * @param {boolean} parameters.clearSelection, clear selection after search
     */
    getBrowserSearch({ commit, dispatch, rootGetters }, parameters) {
      var allData = rootGetters.getDataRecordAndSelection(parameters.containerUuid)

      return new Promise((resolve, reject) => {
        // parameters isQueryCriteria
        var finalParameters = rootGetters.getParametersProcessToServer(parameters.containerUuid)
        var browser = rootGetters.getBrowser(parameters.containerUuid)
        var parsedQuery = parseContext({
          parentUuid: parameters.containerUuid,
          containerUuid: parameters.containerUuid,
          value: browser.query
        })

        var parsedWhereClause
        if (!isEmptyValue(browser.whereClause)) {
          parsedWhereClause = parseContext({
            parentUuid: parameters.containerUuid,
            containerUuid: parameters.containerUuid,
            value: browser.whereClause
          })
        }

        var nextPageToken
        if (!isEmptyValue(allData.nextPageToken)) {
          nextPageToken = allData.nextPageToken + '-' + allData.pageNumber
        }

        var browserSearchQueryParameters = {
          uuid: parameters.containerUuid,
          query: parsedQuery,
          whereClause: parsedWhereClause,
          orderByClause: browser.orderByClause,
          parameters: finalParameters.params,
          nextPageToken: nextPageToken
        }
        // Add validation compare browserSearchQueryParameters
        getBrowserSearch(browserSearchQueryParameters)
          .then(response => {
            const recordList = response.getRecordsList()
            var record = recordList.map(itemRecord => {
              var values = convertValuesMapToObject(itemRecord.getValuesMap())

              // datatables attribute
              values.isEdit = false
              values.isSelected = false
              return values
            })

            var selection = []
            if (!parameters.clearSelection) {
              selection = allData.selection
            }

            var token = response.getNextPageToken()
            if (token !== undefined) {
              token = token.slice(0, -2)
            }

            var pageNumber = rootGetters.getPageNumber(parameters.containerUuid)

            dispatch('recordSelection', {
              containerUuid: parameters.containerUuid,
              record: record,
              pageNumber: pageNumber,
              selection: selection,
              recordCount: response.getRecordcount(),
              nextPageToken: token
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
      })
    }
  }
}

export default browserControl
