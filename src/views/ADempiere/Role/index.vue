<template>
  <div class="app-container">
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
      this.$router.push({ path: '/dashboard' })
      console.log('recarga')
      // this.$router.push({ path: '/documentation/index' })
    }
  }
}
</script>
