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
  if (typeof params !== 'undefined') {
    var title = hasTranslation(params.title)
    var message = hasTranslation(params.message)
    if (params.name) {
      message = params.name + message
    }
    var log = (params.log === undefined) ? '' : params.log
    Notification({
      title: title,
      message: message + '<br>' + log,
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
