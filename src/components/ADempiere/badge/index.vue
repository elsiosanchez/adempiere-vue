<template>
  <el-badge :value="getStart.length" :hidden="getStart.length === 0" type="primary" class="item" style="vertical-align: baseline;">
    <el-popover
      placement="bottom"
      width="400"
      trigger="click"
    >
      <el-table
        :data="getStart"
        highlight-current-row
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="name" :label="$t('navbar.badge.Notifications')" />
        <el-table-column
          fixed="right"
          width="50"
        >
          <template slot-scope="scope">
            <el-button
              icon="el-icon-close"
              type="text"
              size="small"
              @click.native.prevent="deleteRow(scope.$index, getStart)"
            />
          </template>
        </el-table-column>
        <el-table-column
          width="50"
        >
          <router-link :to="{ name: 'ProcessActivity'}">
            <el-tooltip effect="dark" :content="$t('navbar.badge.link')" placement="top-start">
              <svg-icon icon-class="tree-table" />
            </el-tooltip>
          </router-link>
        </el-table-column>
      </el-table>
      <el-button slot="reference" type="text" icon="el-icon-bell" style="float: left;color: #000000;font-size: 121%;font-weight: 615!important;" />
    </el-popover>
  </el-badge>
</template>
<script>
export default {
  name: 'Badge',
  // data() {
  //   return {
  //     currentRow: this.getStart[0]
  //   }
  // },
  computed: {
    getStart() {
      return this.$store.getters.getNotificationProcess
    }
  },
  methods: {
    handleCurrentChange(getStart, val) {
      if (val !== null) {
        if (getStart.isReport) {
          this.$router.push({
            name: 'Report Viewer',
            params: {
              processId: getStart.processId,
              instanceUuid: getStart.instanceUuid,
              fileName: getStart.download
            }
          })
        } else {
          this.$router.push({
            name: 'ProcessActivity'
          })
        }
      }
    },
    deleteRow(index, rows) {
      rows.splice(index, 1)
    }
  }
}
</script>
<style>
.el-badge__content.is-fixed {
    position: absolute;
    top: 6px;
    right: 10px;
    -webkit-transform: translateY(-50%) translateX(100%);
    transform: translateY(-50%) translateX(100%);
}
</style>
