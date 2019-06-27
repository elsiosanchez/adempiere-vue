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
      Notification({
        title: title,
        dangerouslyUseHTMLString: true,
        message: params.name + message + ' <a href="http://localhost:9527/#/ProcessActivity/index"><b><i>ProcessActivity</i></b></a>',
        type: params.type,
        position: 'bottom-right'
      })
    } else {
      Notification({
        title: title,
        message: message,
        type: params.type,
        position: 'bottom-right'
      })
    }
  }
}

export function showMessage(params) {
  Message({
    message: params.message,
    type: params.type,
    showClose: true
  })
}
