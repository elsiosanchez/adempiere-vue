<template>
  <div class="app-container">
    <h3 class="warn-content text-center">
      Role  {{ name }}
    </h3>
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
    name() {
      return this.$store.getters.name
    }
  },

  methods: {
    handleRolesChange() {
      this.$router.push({ path: '/permission/index?' + +new Date() })
    }
  }
}
</script>
