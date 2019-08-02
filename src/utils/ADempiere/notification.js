import { Message, Notification } from 'element-ui'
import language from '@/lang'

export function hasTranslation(text) {
  const hasKey = language.te('notifications.' + text)
  if (hasKey) {
    const translatedText = language.t('notifications.' + text)

    return translatedText
  }
  return text
}

export function showNotification(parameters) {
  if (parameters !== undefined) {
    var title = hasTranslation(parameters.title)
    var message = hasTranslation(parameters.message)
    //  For summary
    if (parameters.summary !== undefined) {
      if (message !== undefined) {
        message = message + '<br>' + parameters.summary
      } else {
        message = parameters.summary
      }
    }
    //  For logs
    if (parameters.logs !== undefined) {
      parameters.logs.forEach(logResult => {
        if (logResult !== undefined) {
          message = message + '<br>' + logResult.log
        }
      })
    }
    if (parameters.name) {
      message = parameters.name + message
    }
    Notification({
      title: title,
      message: `<div style="max-height: 100px; overflow-y: auto;">` + message + `</div>`,
      type: parameters.type,
      position: 'bottom-right',
      dangerouslyUseHTMLString: true
    })
  }
}

export function showMessage(parameters) {
  Message({
    message: parameters.message,
    type: parameters.type,
    showClose: true
  })
}
