import { getLanguage } from '@/lang/index'
import Access from '@adempiere/grpc-access-client'
import { HOST_GRPC_AUTHENTICATION } from '@/api/ADempiere/constants'

// Instance for connection
function Instance() {
  return new Access(
    HOST_GRPC_AUTHENTICATION,
    'Version Epale',
    getLanguage() || 'en_US'
  )
}

// Make login by UserName and password, this function can return user data for show
export function login(loginValues) {
  return Instance.call(this).requestLoginDefault(loginValues.username, loginValues.password, loginValues.language)
}

// Get User Info from session Uuid or token
export function getInfo(token) {
  return Instance.call(this).requestUserInfoFromSession(token)
    .then(session => {
      var roles = []
      var rolesList = session.getRolesList().map(itemRol => {
        roles.push(itemRol.getName())
        return {
          id: itemRol.getId(),
          uuid: itemRol.getUuid(),
          name: itemRol.getName(),
          description: itemRol.getDescription(),
          clientId: itemRol.getClientid(),
          clientName: itemRol.getClientname()
        }
      })

      const response = {
        name: session.getUserinfo().getName(),
        comments: session.getUserinfo().getComments(),
        description: session.getUserinfo().getDescription(),
        // TODO: Add from ADempiere
        avatar: 'https://avatars1.githubusercontent.com/u/1263359?s=200&v=4',
        introduction: session.getUserinfo().getDescription(),
        roles: rolesList,
        rolesList: rolesList
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
