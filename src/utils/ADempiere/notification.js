import { Message, Notification } from 'element-ui'

export function showNotification(params) {
  Notification({
    title: params.title,
    message: params.message,
    type: params.type,
    position: 'bottom-right'
  })
}

export function showMessage(params) {
  Message({
    message: params.message,
    type: params.type,
    showClose: true
  })
}
