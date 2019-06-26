import { Notification } from 'element-ui'
import i18n from '@/lang'

export function showNotification(params) {
  if (typeof params !== 'undefined') {
    var title = hasTranslation(params.title)
    var message = hasTranslation(params.message)
    if (params.name) {
      Notification({ title: title, message: params.name + message, type: params.type })
    } else {
      Notification({ title: title, message: message, type: params.type })
    }
  }
}

export function hasTranslation(text) {
  const hasKey = i18n.te('notifications.' + text)
  if (hasKey) {
    const translatedText = i18n.t('notifications.' + text)

    return translatedText
  }
  return text
}
