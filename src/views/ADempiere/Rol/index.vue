<template>
  <div class="app-container">
    <h3 class="warn-content text-center">
      Roles
    </h3>
    {{ name }}
    <!-- <switch-roles @change="handleRolesChange" /> -->
  </div>
</template>
<script>
// import SwitchRoles from './components/SwitchRoles'
export default {
  name: 'Rol',
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
  created() {
    this.controlError()
  },
  methods: {
    controlError() {
      this.$store.subscribeAction({
        before: (action, state) => {
          if (action.type === 'startProcess') {
            this.$notify.info({
              title: 'Info',
              message: 'Processing ' + action.type
            })
          }
        },
        after: (action, state) => {
          if (action.type === 'startProcess') {
            this.$notify.error({
              title: 'Error',
              message: 'Error Processing ' + action.type
            })
          }
        }
      })
    }
  }
}
</script>
