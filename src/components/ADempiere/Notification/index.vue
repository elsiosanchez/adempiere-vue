<template>
  <div class="wrapper">
    <h3 class="warn-content text-center">
      Proccess
    </h3>
    <el-collapse>
      <el-collapse-item v-for="(item, index) in processRunning" :key="index" :title="item.name">
        {{ item.description }}
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
export default {
  name: 'Notification',
  computed: {
    processRunning() {
      return this.$store.getters.getRunningProcess()
    }
  }
}
</script>
