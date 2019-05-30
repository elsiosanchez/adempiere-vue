<template>
  <div>
    <div style="margin-bottom:15px;">
      {{ $t('permission.roles') }}: {{ roles }}
    </div>
    {{ $t('permission.switchRoles') }}:
    <el-radio-group v-for="(item, key) in roles" :key="key" v-model="switchRoles">
      <el-radio-button :key="key" :label="item.name" />
    </el-radio-group>
  </div>
</template>

<script>
export default {
  // data() {
  //   return {
  //     switchRoles: this.roles[0]
  //   }
  // },
  computed: {
    roles() {
      return this.$store.getters.roles
    },
    switchRoles: {
      get() {
        return this.roles[0]
      },
      set(val) {
        this.$store.dispatch('user/changeRoles', val).then(() => {
          this.$emit('change')
        })
      }
    }
  }
}
</script>
