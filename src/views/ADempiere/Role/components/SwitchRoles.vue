<template>
  <div>
    <div style="margin-bottom:15px;">
      {{ $t('permission.roles') }}:
      <ul id="example-1">
        <template v-for="item in roles">
          {{ item.name }}
        </template>
      </ul>
    </div>
    {{ $t('permission.switchRoles') }}:
    <el-radio-group v-for="(item,index) in roles" :key="index" v-model="switchRoles">
      <el-radio-button :key="index"> {{ item.name }} </el-radio-button>
      <!-- <el-radio-button :key="index"> {{ item.name }} </el-radio-button> -->
    </el-radio-group>
  </div>
</template>

<script>
export default {
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
