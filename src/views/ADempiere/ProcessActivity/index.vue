<template>
  <div v-if="a.length > 0" class="wrapper">
    <h3 class="warn-content text-center">
      Process Activity
    </h3>
    <el-table :data="a" :stripe="true" style="width: 100%">
      <el-table-column prop="name" label="name" />
      <el-table-column prop="description" label="description" />
      <el-table-column prop="action" label="action" />
      <el-table-column label="see report">
        <template slot-scope="scope">
          <router-link :to="{ name: 'Report Viewer', params: {instanceUuid: scope.row.reportInfo.instanceUuid, processUuid: scope.row.reportInfo.processUuid, fileName: scope.row.reportInfo.output.fileName}}">
            <span><svg icon-class="clipboard" /></span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Status">
        <el-popover ref="popover" placement="right" title="Status" width="400" trigger="click" :content="status" />
        <el-button v-popover:popover type="text">detail of the process</el-button>
      </el-table-column>
    </el-table>
  </div>
  <div v-else class="errPage-container">
    <el-row>
      <el-col :span="8">.
      </el-col>
      <el-col :span="8">
        <h1>
          Oops! Not process running
        </h1>
        <img :src="errGif" width="313" height="428" alt="Girl has dropped her ice cream.">
      </el-col>
    </el-row>
  </div>
</template>
<script>
import errGif from '@/assets/401_images/401.gif'

export default {
  name: 'ProcessActivity',
  data() {
    return {
      errGif: errGif + '?' + +new Date(),
      tableColumns: ['Name', 'Description', 'Action', 'See Report', 'Status'],
      showDialog: false,
      status: ''
    }
  },
  computed: {
    processRunnings() {
      return this.$store.getters.getRunningProcess()
    },
    a() {
      var a = this.$store.getters.getRunningProcess().map((item) => {
        var reportInfo
        var status
        if (item.isReport) {
          reportInfo = this.$store.getters.getReportInfo(item.uuid)
        }
        return {
          name: item.name,
          description: item.description,
          action: item.action,
          output: item.output,
          logs: item.logs,
          status: status,
          isReport: item.isReport,
          reportInfo: reportInfo
        }
      })
      return a
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
