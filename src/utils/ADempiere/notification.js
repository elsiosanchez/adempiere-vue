import { Notification } from 'element-ui'
import i18n from '@/lang'

export function showNotification(params) {
  Notification({ title: i18n.t('notifications.' + params.title), message: i18n.t('notifications.' + params.message), type: params.type })
}
