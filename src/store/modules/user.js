import { login, logout, getInfo, changeRole } from '@/api/user'
import { convertRoleFromGRPC } from '@/utils/ADempiere'
import { getToken, setToken, removeToken, getCurrentRole, setCurrentRole, removeCurrentRole } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { clientDateTime } from '@/utils/ADempiere/valueUtil.js'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  rol: {}, // info current rol
  rolesList: [],
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ROLES_LIST: (state, payload) => {
    state.rolesList = payload
  },
  SET_ROL: (state, rol) => {
    state.rol = rol
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(response => {
          var data = {
            id: response.getId(),
            token: response.getUuid(),
            name: response.getUserinfo().getName(),
            avatar: 'https://avatars1.githubusercontent.com/u/1263359?s=200&v=4',
            currentRole: convertRoleFromGRPC(response.getRole()),
            isProcessed: response.getProcessed()
          }

          commit('SET_TOKEN', data.token)
          commit('SET_ROL', data.currentRole)
          setToken(data.token)
          setCurrentRole(data.currentRole.uuid)
          resolve(data)
        }).catch(error => {
          reject(error)
        })
    })
  },
  // get user info
  getInfo({ commit, state, dispatch }, sessionUuid = null) {
    if (!sessionUuid) {
      sessionUuid = getToken()
    }
    return new Promise((resolve, reject) => {
      getInfo(sessionUuid).then(response => {
        if (!response) {
          reject('Verification failed, please Login again.')
        }
        // roles must be a non-empty array
        if (!response.rolesList || response.rolesList.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        var rol = response.rolesList.find(itemRol => {
          return itemRol.uuid === getCurrentRole()
        })

        dispatch('setMultipleContext', [
          { columnName: '#AD_User_Name', value: response.name },
          { columnName: '#AD_Role_ID', value: rol.id },
          { columnName: '#AD_Role_Name', value: rol.name },
          { columnName: '#AD_Client_ID', value: rol.clientId },
          { columnName: '#AD_Client_Name', value: rol.clientName },
          { columnName: '#Date', value: clientDateTime() },
          // TODO: Support in request
          // { columnName: '#AD_User_ID', value: response.id },
          { columnName: '#SysAdmin', value: 'Y' },
          { columnName: '#User_Level', value: 'S' }
        ], {
          root: true
        })

        commit('SET_ROLES_LIST', response.rolesList)
        commit('SET_ROLES', response.roles)
        commit('SET_NAME', response.name)
        commit('SET_ROL', rol)
        commit('SET_AVATAR', response.avatar)
        commit('SET_INTRODUCTION', response.introduction)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        dispatch('clearProcessControl', null, {
          root: true
        })
        removeToken()
        removeCurrentRole()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },
  // dynamically modify permissions
  changeRoles({ commit, state, dispatch }, roleUuid) {
    /**
     * @param {string} attributes.sessionUuid
     * @param {string} attributes.roleUuid
     * @param {string} attributes.organizationUuid
     * @param {string} attributes.warehouseUuid
     */
    return new Promise((resolve, reject) => {
      changeRole({
        sessionUuid: getToken(),
        roleUuid: roleUuid,
        organizationUuid: null,
        warehouseUuid: null
      }).then(response => {
        var rol = convertRoleFromGRPC(response.getRole())
        commit('SET_ROL', rol)
        setCurrentRole(rol.uuid)
        commit('SET_TOKEN', response.getUuid())
        setToken(response.getUuid())

        // Update user info and context associated with session
        dispatch('getInfo', response.getUuid())
          .then(() => {
            var route = router.app._route
            var selectedTag = {
              fullPath: route.fullPath,
              hash: route.hash,
              matched: route.matched,
              meta: route.meta,
              name: route.name,
              params: route.params,
              path: route.path,
              query: route.query,
              title: route.meta.title
            }
            dispatch('tagsView/delOthersViews', selectedTag, { root: true })
          })

        resolve({
          ...rol,
          sessionUuid: response.getUuid()
        })
      }).catch(error => {
        reject(error)
      })
    })
    //  return new Promise(async resolve => {
    //  const token = role
    //  commit('SET_TOKEN', token)
    //  commit('SET_CURRENTROLE',)
    //  setToken(token)
    //  const { roles } = await dispatch('getInfo')

    //  generate accessible routes map based on   roles
    //  const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

    //  dynamically add accessible routes
    //  router.addRoutes(accessRoutes)
    // })
  }
}

const getters = {
  getRoles: (state) => {
    return state.rolesList
  },
  // current rol info
  getRol: (state) => {
    return state.rol
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
