<template>
  <div class="app-container">
    <h2> {{ currentRole }} </h2>
    <switch-roles @change="handleRolesChange" />
  </div>
</template>

<script>
import SwitchRoles from './components/SwitchRoles'

export default {
  name: 'Role',
  components: { SwitchRoles },
  data() {
    return {
      rol: []
    }
  },
  computed: {
    currentRole() {
      return this.$store.getters.currentrole
    },
    roles() {
      return this.$store.getters.roles
    },
    switchRoles: {
      get() {
        return this.roles[1]
      }
    }
  },
  methods: {
    handleRolesChange() {
      // this.rol = this.role
      // if (typeof this.rol !== 'undefined') {
      //   this.$store.dispatch('SET_rol')
      //   this.rol = this.$store.gett
      // }
      console.log(this.rol)
      this.$router.push({ path: '/documentation/index' })
    }
  }
}
</script>
