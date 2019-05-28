<template>
  <div class="app-container">
    <h3 class="warn-content text-center">
      Roles
    </h3>
    <switch-roles @change="handleRolesChange" />
  </div>
</template>
<script>
import SwitchRoles from './components/SwitchRoles'
export default {
  name: 'Rol',
  components: {
    SwitchRoles
  },
  data() {
    return {
      showDialog: false
    }
  },
  computed: {
    name() {
      return this.$store.getters.name
    }
  },
  methods: {
    handleRolesChange() {
      this.$router.push({ path: '/documentation/index?' })
    }
  }
}
</script>
