import { Message, Notification } from 'element-ui'
import i18n from '@/lang'

export function hasTranslation(text) {
  const hasKey = i18n.te('notifications.' + text)
  if (hasKey) {
    const translatedText = i18n.t('notifications.' + text)

    return translatedText
  }
  return text
}

export function showNotification(params) {
  if (params !== undefined) {
    var title = hasTranslation(params.title)
    var message = hasTranslation(params.message)
    //  For summary
    if (params.summary !== undefined) {
      if (message !== undefined) {
        message = message + '<br>' + params.summary
      } else {
        message = params.summary
      }
    }
    //  For logs
    if (params.logs !== undefined) {
      params.logs.forEach((logResult) => {
        if (logResult !== undefined) {
          message = message + '<br>' + logResult.log
        }
      })
    }
    Notification({
      title: title,
      message: message,
      type: params.type,
      position: 'bottom-right',
      dangerouslyUseHTMLString: true
    })
  }
}

export function showMessage(params) {
  Message({
    message: params.message,
    type: params.type,
    showClose: true
  })
}
