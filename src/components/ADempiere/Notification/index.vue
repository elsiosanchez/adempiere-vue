<template>
  <div class="wrapper">
    <h3 class="warn-content text-center">
      Proccess
    </h3>
    <table v-if="processRunning.length > 0">
      <tr v-for="(item, index) in processRunning" :key="index">
        <td>
          {{ item.name }}
        </td>
        <td>
          <el-button type="text" size="small" @click.native.prevent="deleteRow(item.uuid)">
            Eliminar
          </el-button>
        </td>
      </tr>
    </table>
    <h2 v-else>
      <b>Not process running</b>
    </h2>
  </div>
</template>

<script>
export default {
  name: 'Notification',
  computed: {
    processRunning() {
      return this.$store.getters.getRunningProcess
    }
  },
  methods: {
    deleteRow(uuid) {
      this.$store.dispatch('deleteProcess', uuid)
    }
  }
}
</script>
