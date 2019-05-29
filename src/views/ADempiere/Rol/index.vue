<template>
  <div class="app-container">
    <h3 class="warn-content text-center">
      {{ roles }}
      {{ name }}
    </h3>
    <switch-roles @change="handleRolesChange" />
    <!-- <el-button @click="handleRolesChange" > Rol </el-button> -->
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
      rol: [],
      showDialog: false
    }
  },
  computed: {
    name() {
      return this.$store.getters.name
    },
    roles() {
      return this.$store.getters.getRoles()
    }
  },
  created() {
    console.log(this.$store.getters.getRoles())
    console.log(this.$store.getters.roles)
  },
  methods: {
    handleRolesChange() {
      this.rol = this.$store.getters.roles
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
