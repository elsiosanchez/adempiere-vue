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
  components: {
    SwitchRoles
  },
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
      this.rol = this.$store.dispatch('getRol')
      // if(this.rol === 'GardenAdmin'){
      //   this.$store.dispatch('getRol')
      // }
      console.log(this.rol)
      return this.rol
      // this.$router.push({ path: '/documentation/index?' })
    }
  }
}
</script>
