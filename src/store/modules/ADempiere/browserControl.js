import { getBrowserSearch } from '@/api/ADempiere/data'
import { convertValueFromGRPC, parseContext } from '@/utils/ADempiere'
import { showMessage } from '@/utils/ADempiere/notification'
import i18n from '@/lang'

const browserControl = {
  state: {
    browserSearch: []
  },
  mutations: {
    addBrowserSearch(state, payload) {
      state.browserSearch = payload
    }
  },
  actions: {
    /**
     *
     * @param {string} params.containerUuid, browsert to search record data
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
          getBrowserSearch(browserSearchQueryParameters)
            .then(response => {
              const recordList = response.getRecordsList()
              var record = recordList.map(itemRecord => {
                const map = itemRecord.getValuesMap()
                var values = {}
                map.forEach((value, key) => {
                  values[key] = convertValueFromGRPC(value)
                })

                // datatables attribute
                values.edit = false
                return values
              })

              var selection = []
              if (!params.clearSelection) {
                selection = rootGetters.getDataRecordSelection(params.containerUuid)
              }

              dispatch('recordSelection', {
                containerUuid: params.containerUuid,
                record: record,
                selection: selection
              })
              var notificationParams = {
                title: i18n.t('notifications.succesful'),
                message: i18n.t('notifications.succcessSearch'),
                type: 'success'
              }
              showMessage(notificationParams)
              resolve(record)
            })
            .catch(err => {
              var notificationParams = {
                title: i18n.t('notifications.error'),
                message: i18n.t('notifications.errorSearch'),
                type: 'error'
              }
              showMessage(notificationParams)
              reject(err)
            })
        }
      })
    }
  },
  getters: {
    getResponseBrowser: (state) => () => {
      return state.browserSearch
    }
  }
}

export default browserControl
