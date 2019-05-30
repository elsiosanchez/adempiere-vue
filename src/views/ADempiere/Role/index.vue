<template>
  <div class="app-container">
    <h3 class="warn-content text-center">
      Your Role
    </h3>
    <br>
    <h2>
      {{ currentrole }}
    </h2>
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
      rol: [],
      isRol: [],
      showDialog: false
    }
  },
  computed: {
    currentrole() {
      return this.$store.getters.currentrole
    }
  },

  methods: {
    handleRolesChange() {
      this.$router.push({ path: '/permission/index?' + +new Date() })
    }
  }
}
</script>
