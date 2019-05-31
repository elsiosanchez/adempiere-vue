<template>
  <div>
    <div style="margin-bottom:15px;">
      <h2> {{ $t('permission.roles') }}: {{ currentRole }} </h2>
    </div>
    {{ $t('permission.switchRoles') }}:
    <el-radio-group v-for="(item, key) in roles" :key="key" v-model="switchRoles">
      <el-radio-button :key="key" :label="item.name" />
    </el-radio-group>
  </div>
</template>

<script>
export default {
  computed: {
    currentRole() {
      return this.$store.getters.currentRole
    },
    roles() {
      return this.$store.getters.roles
    },
    switchRoles: {
      get() {
        return this.roles[0]
      },
      set(val) {
        this.$store.dispatch('user/changeRoles', val)
        this.$router.push({ path: '/dashboard' })
      }
    }
  }
}
</script>
