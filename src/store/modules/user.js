import { login, logout, getInfo, changeRole } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  currentRole: '',
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
      login({ username: username.trim(), password: password }).then(response => {
        console.log(username)
        console.log(password)
        console.log(userInfo)
        const { data } = response
        console.log(data)
        commit('SET_TOKEN', data.token)
        commit('SET_CURRENTROLE', data.currentRole)
        setToken(data.token)
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
        const { data } = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        const { roles, name, avatar, introduction } = data
        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_CURRENTROLE', rootGetters.currentRole)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // change role
  changeRole({ commit, state, rootGetters }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      changeRole({ username: username, password: password }).then(response => {
        const { data } = response
        console.log(data)
        commit('SET_TOKEN', data.token)
        commit('SET_CURRENTROLE', data.role)
        setToken(data.token)
        resolve()
        // state.token).then(response => {
        // const { role } = data
        // console.log(data)
        // // commit('SET_TOKEN', data.token)
        // commit('SET_ROLES', role)
        // // setToken(data.token)
        // resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, rootGetters }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_CURRENTROLE', rootGetters.currentRole)
        commit('SET_ROLES', '')
        removeToken()
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
    console.log(getToken())
    console.log(role)
    commit('SET_CURRENTROLE', role)

    return new Promise(async resolve => {
      const token = role
      commit('SET_TOKEN', token)
      //   // commit('SET_CURRENTROLE',)
      // setToken(token)
      console.log(token)
      // const { roles } = await dispatch('getInfo')

      // // // generate accessible routes map based on   roles
      // const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

    //   // // // dynamically add accessible routes
    // router.addRoutes(accessRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
