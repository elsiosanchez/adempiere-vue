import { login, logout, getInfo, changeRole } from '@/api/user'
import { convertRoleFromGRPC } from '@/utils/ADempiere'
import { getToken, setToken, removeToken, getCurrentRole, setCurrentRole, removeCurrentRole } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  currentRole: '',
  rol: {},
  currentRolUuid: getCurrentRole(),
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
  SET_CURRENTROLE: (state, currentRole) => {
    state.currentRole = currentRole
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
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
            currentRole: convertRoleFromGRPC(response.getRole())
          }

          commit('SET_TOKEN', data.token)
          commit('SET_CURRENTROLE', data.currentRole.name)
          commit('SET_ROL', data.currentRole)
          setToken(data.token)
          setCurrentRole(data.currentRole.uuid)
          resolve()
        }).catch(error => {
          reject(error)
        })
    })
  },
  // get user info
  getInfo({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        if (!response) {
          reject('Verification failed, please Login again.')
        }
        // const { roles, name, avatar, introduction } = data
        // roles must be a non-empty array
        if (!response.roles || response.roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        var rol = response.roles.find(itemRol => {
          return itemRol.uuid === getCurrentRole()
        })
        dispatch('getMessagesFromServer', {
          table: 'AD_Message',
          criteria: "IsActive = 'Y'"
        },
        { root: true })
        commit('SET_ROLES', response.roles)
        commit('SET_NAME', response.name)
        commit('SET_ROL', rol)
        commit('SET_CURRENTROLE', rol.name)
        commit('SET_AVATAR', response.avatar)
        commit('SET_INTRODUCTION', response.introduction)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
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
  changeRoles({ commit, state }, roleUuid) {
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
        var role = convertRoleFromGRPC(response.getRole())
        commit('SET_ROL', role)

        commit('SET_CURRENTROLE', role.name)
        setCurrentRole(role.uuid)
        commit('SET_TOKEN', response.getUuid())
        setToken(response.getUuid())
        resolve({
          ...role,
          sessionUuid: response.getUuid()
        })
      }).catch(error => {
        reject(error)
      })
    })
    // return new Promise(async resolve => {
    //   const token = role
    //   commit('SET_TOKEN', token)
    //   // commit('SET_CURRENTROLE',)
    //   setToken(token)
    //   // const { roles } = await dispatch('getInfo')

    //   // // // generate accessible routes map based on   roles
    //   // const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

    //   // // // dynamically add accessible routes
    //   // router.addRoutes(accessRoutes)
    // })
  }
}

const getters = {
  getCurrentRole: (state) => {
    return state.currentRole
  },
  getRoles: (state) => {
    return state.roles
  },
  getRol: (state) => {
    return state.rol
  },
  getState: () => {
    return state
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
