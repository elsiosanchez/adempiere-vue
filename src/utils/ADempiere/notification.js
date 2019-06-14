import { Notification } from 'element-ui'

export function showNotification(params) {
  Notification({ title: params.title, message: params.message, type: params.type })
}
