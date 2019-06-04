<template>
  <div v-if="processListData.length > 0" class="wrapper">
    <h3 class="warn-content text-center">
      Process Activity
    </h3>
    <el-table :data="processListData" :stripe="true" class="table">
      <template v-for="(item, key) in tableColumns">
        <el-table-column :key="key" :label="item">
          <template slot-scope="scope">
            <span>{{ scope.row[item] }}</span>
          </template>
        </el-table-column>
      </template>
      <el-table-column label="Report" prop="Report">
        <template slot-scope="scope">
          <router-link
            v-if="scope.row.Report.instanceUuid!=='undefined'"
            :to="{
              name: 'Report Viewer',
              params: {
                instanceUuid: scope.row.Report.instanceUuid,
                processUuid: scope.row.Report.processUuid,
                fileName: scope.row.Report.output.fileName
              }
            }"
          >
            <i class="el-icon-printer" />
          </router-link>
        </template>
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
      tableColumns: ['Name', 'Description', 'Action', 'Status'],
      showDialog: false,
      status: ''
    }
  },
  computed: {
    processRunnings() {
      return this.$store.getters.getRunningProcess()
    },
    processListData() {
      var processListData = this.$store.getters.getRunningProcess().map((item) => {
        var reportInfo = {
          instanceUuid: 'undefined',
          processUuid: item.uuid,
          isError: false,
          summary: '',
          resultTableId: 0,
          logs: [],
          output: {
            uuid: '',
            name: '',
            description: '',
            fileName: 'undefined',
            output: '',
            outputStream: {},
            reportExportType: '',
            isRootInsert: false,
            elm: {}
          }
        }
        var status = 'Processing'
        if (item.isReport) {
          reportInfo = this.$store.getters.getReportInfo(item.uuid)
          if (reportInfo.isError) {
            status = 'Error'
          } else {
            status = 'Completed'
          }
        }
        return {
          Name: item.name,
          Description: item.description,
          Action: item.action,
          Status: status,
          Report: reportInfo
        }
      })
      return processListData
    }
  }
}
</script>
<style>
  .table {
    width: 100%;
    padding: 15px;
  }
</style>
