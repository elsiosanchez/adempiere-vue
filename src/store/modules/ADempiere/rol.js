import { getInfo } from '@/api/user'
// import { type } from 'os'

const rol = {
  state: {
    rol: []
  },
  mutations: {
    addRollist(state, payload) {
      state.rol.push(payload)
    }
  },
  actions: {
    getRol: ({ commit, rootState }) => {
      var token = rootState.user.token
      getInfo(token)
        .then(response => {
          console.log(response)
          var rolList = response.UserInfoValue().map((roles) => {
            return {
              id: roles.getId(),
              uuid: roles.getUuid(),
              name: roles.getName()
            }
          })
          console.log(rolList)
          commit('addRollist', rolList)
        })
    // requestUserInfoFromSession(sessionUuid).then(session => {
    //     console.log(session.getRolesList())
    //     var rolList = session.getRolesList().map((roles) => {
    //     return {
    //         id: roles.getId(),
    //         uuid: roles.getUuid(),
    //         name: roles.getName()
    //     }
    // })
    }
  },
  getters: {
    getRoles: (state, rootGetters) => (sessionUuid) => {
      var listrol = state.rol.map(() => {
        var rol = rootGetters.roles()
        return rol
      })
      console.log(rootGetters.name)
      console.log(state.rol)
      console.log(rol)
      return (listrol)
    }
  }
}

export default rol
