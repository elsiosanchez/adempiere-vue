import Access from '@adempiere/grpc-access-client'
import { HOST_GRPC_AUTHENTICATION } from '@/api/ADempiere/constants'

// Instance for connection
function Instance() {
  return new Access(
    HOST_GRPC_AUTHENTICATION,
    'Version Epale'
  )
}

// Get User Info from session Uuid or token
export function getInfo(sessionUuid) {
  return Instance.call(this).requestUserInfoFromSession(sessionUuid).then(session => {
    const response = {
      data: {
        name: session.getUserinfo().getName(),
        // TODO: Add from ADempiere
        avatar: 'https://avatars1.githubusercontent.com/u/1263359?s=200&v=4',
        introduction: session.getUserinfo().getComments(),
        roles: ['admin', 'editor']
      }
    }
    return response
  }).catch(error => {
    console.log(error)
  })
}

// Make login by UserName and password, this function can return user data for show
export function login(loginValues) {
  return Instance.call(this).requestLoginDefault(loginValues.username, loginValues.password, loginValues.language).then(session => {
    const response = {
      data: {
        token: session.getUuid(),
        name: session.getUserinfo().getName(),
        avatar: 'https://avatars1.githubusercontent.com/u/1263359?s=200&v=4',
        introduction: session.getUserinfo().getComments(),
        roles: ['admin', 'editor']
      }
    }
    return response
  }).catch(error => {
    console.log(error)
  })
}

// Logout from server
export function logout(sessionUuid) {
  return Instance.call(this).requestLogout(sessionUuid)
}

// Get User menu from server
export function getMenu(sessionUuid) {
  return Instance.call(this).requestUserMenuFromSession(sessionUuid)
}
