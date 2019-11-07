import { forgotPassword, resetPasswordFromToken } from '@/api/ADempiere/enrollment'
import { showMessage, isEmptyValue } from '@/utils/ADempiere'
import language from '@/lang'
import router from '@/router'

const enrollment = {
  actions: {
    /**
     * @param {string} eMailOrUserName
     */
    forgotPassword({ commit }, eMailOrUserName) {
      return forgotPassword(eMailOrUserName)
        .then(response => {
          if (response.getResponsetype() === 0) {
            showMessage({
              message: language.t('login.passwordResetSendLink') + eMailOrUserName,
              type: 'success'
            })
            if (isEmptyValue(response.getToken())) {
              router.push({
                path: 'login'
              })
            } else {
              router.push({
                path: 'passwordReset',
                query: {
                  token: response.getToken()
                }
              })
            }
          } else {
            showMessage({
              message: language.t('login.unexpectedError'),
              type: 'error'
            })
          }
          return response
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'error'
          })
          console.warn('Enrollment Forgot Password - Error ' + error.code + ': ' + error.message)
        })
    },
    /**
     * @param {string} parameters.token
     * @param {string} parameters.password
     */
    resetPasswordFromToken({ commit }, parameters) {
      return resetPasswordFromToken(parameters.token, parameters.password)
        .then(response => {
          if (response.getResponsetype() === 0) {
            showMessage({
              message: language.t('login.passwordResetSuccessful'),
              type: 'success'
            })
          } else {
            showMessage({
              message: language.t('login.unexpectedError'),
              type: 'error'
            })
          }
          router.push({
            path: 'login'
          })
        })
        .catch(error => {
          console.warn(error)
        })
    }
  }
}

export default enrollment
