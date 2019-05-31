import Access from '@adempiere/grpc-access-client'
import { HOST_GRPC_AUTHENTICATION } from '@/api/ADempiere/constants'

// Instance for connection
function Instance() {
  return new Access(
    HOST_GRPC_AUTHENTICATION,
    'Version Epale'
  )
}
// Make login by UserName and password, this function can return user data for show
export function login(loginValues) {
  return Instance.call(this).requestLoginDefault(loginValues.username, loginValues.password, loginValues.language).then(session => {
    // console.log(session.getRole().getName())
    const response = {
      data: {
        token: session.getUuid(),
        name: session.getUserinfo().getName(),
        avatar: 'https://avatars1.githubusercontent.com/u/1263359?s=200&v=4',
        introduction: session.getRole().getName(),
        currentRole: session.getRole().getName(),
        roles: session.getRole()
      }
    }
    console.log(response)
    return response
  }).catch(error => {
    console.log(error)
  })
}

// Get User Info from session Uuid or token
export function getInfo(token) {
  return Instance.call(this).requestUserInfoFromSession(token).then(session => {
    console.log(session.getRolesList())
    var roles = []
    var rolList = session.getRolesList().map((roles) => {
      return {
        id: roles.getId(),
        uuid: roles.getUuid(),
        name: roles.getName()
      }
    })
    rolList.forEach(element => {
      roles.push(element.name)
    })
    console.log(roles)
    console.log(rolList)
    // console.log(getUserinfo())
    const response = {
      data: {
        name: session.getUserinfo().getName(),
        // TODO: Add from ADempiere
        avatar: 'https://avatars1.githubusercontent.com/u/1263359?s=200&v=4',
        introduction: session.getUserinfo().getDescription(),
        roles: rolList
      }
    }
    console.log(response)
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
