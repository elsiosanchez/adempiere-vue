<template>
  <el-popover
    placement="bottom"
    width="400"
    trigger="click"
  >
    <el-table :data="getStart">
      <el-table-column prop="name" :label="$t('navbar.Notifications')" />
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
    </el-table>
    <el-button slot="reference" type="text" icon="el-icon-bell" style="padding-top: 14px;float: left;color: #000000;font-size: 121%;font-weight: 615!important;" />
  </el-popover>
</template>
<script>
export default {
  name: 'Badge',
  computed: {
    getStart() {
      return this.$store.getters.getInitializedProcess
    },
    getEnd() {
      return this.$store.getters.getResult.length
    }
  },
  methods: {
    deleteRow(index, rows) {
      rows.splice(index, 1)
    }
  }
}
</script>
