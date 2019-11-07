import { forgotPassword, resetPasswordFromToken } from '@/api/ADempiere/enrollment'
import { showMessage } from '@/utils/ADempiere'
import language from '@/lang'

const enrollment = {
  actions: {
    forgotPassword({ commit }, eMailOrUserName) {
      return forgotPassword(eMailOrUserName)
        .then(response => {
          showMessage({
            message: language.t('login.resetSuccessful') + eMailOrUserName,
            type: 'success'
          })
          return response
        })
        .catch(error => {
          showMessage({
            message: language.t('login.unexpectedError'),
            type: 'error'
          })
          console.warn('Enrollment Forgot Password - Error ' + error.code + ': ' + error.message)
        })
    },
    resetPasswordFromToken({ commit }, parameters) {
      return resetPasswordFromToken(parameters.userName, parameters.eMail)
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.warn(error)
        })
    }
  }
}

export default enrollment
