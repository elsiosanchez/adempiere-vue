import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken, getCurrentRole, setCurrentRole, removeCurrentRole } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  currentRole: '',
  currentUuid: getCurrentRole(),
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
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(response => {
          var role = response.getRole()

          var data = {
            id: response.getId(),
            token: response.getUuid(),
            name: response.getUserinfo().getName(),
            avatar: 'https://avatars1.githubusercontent.com/u/1263359?s=200&v=4',
            currentRole: {
              id: role.getId(),
              uuid: role.getUuid(),
              name: role.getName(),
              desctipcion: role.getDescription(),
              clientId: role.getClientid(),
              clientName: role.getClientname()
            }
          }

          commit('SET_TOKEN', data.token)
          commit('SET_CURRENTROLE', data.currentRole.name)
          setToken(data.token)
          setCurrentRole(data.currentRole.uuid)
          resolve()
        }).catch(error => {
          reject(error)
        })
    })
  },
  // get user info
  getInfo({ commit, state, rootGetters }) {
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

        var currentRole = {}
        var name = rootGetters.currentRole
        if (typeof name !== undefined && name !== '') {
          currentRole.name = name
        } else {
          var rol = response.roles.find(itemRol => {
            return itemRol.uuid === getCurrentRole()
          })
          currentRole.name = rol.name
        }

        commit('SET_ROLES', response.roles)
        commit('SET_NAME', response.name)
        commit('SET_CURRENTROLE', currentRole.name)
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
  changeRoles({ commit, dispatch }, role) {
    commit('SET_CURRENTROLE', role)
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
