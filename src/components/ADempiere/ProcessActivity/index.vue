<template>
  <div class="wrapper">
    <h3 class="warn-content text-center">
      Process Activite
    </h3>
    <el-popover
      v-for="(item, index) in processRunning"
      :key="index"
      placement="left-start"
      width="400"
      trigger="click"
    >
      <div>
        <p>{{ item.description }}</p>
      </div>
      <el-table
        slot="reference"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column
          prop="date"
          width="420"
        > {{ item.name }}
        </el-table-column>
        <el-table-column
          prop="name"
          width="400"
        >
          2016-05-02
        </el-table-column>
        <el-table-column
          prop="address"
        >
          Start Process
        </el-table-column>
        <el-table-column
          prop="address"
        >
          <router-link :to="{ name: 'Report Viewer' }"><svg-icon icon-class="documentation" />
          </router-link>
        </el-table-column>
      </el-table>
    </el-popover>
  </div>
</template>
<script>
export default {
  name: 'Notification',
  data() {
    return {
      tableData: [{
      }]
    }
  },
  computed: {
    processRunning() {
      return this.$store.getters.getRunningProcess()
    }
  }
}
</script>
