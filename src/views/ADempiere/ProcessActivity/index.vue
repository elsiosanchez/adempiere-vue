<template>
  <div v-if="processListData.length > 0" class="wrapper">
    <h3 class="warn-content text-center">
      Process Activity
    </h3>
    <el-table ref="dragTable" :data="processListData" :stripe="true" class="table" border>
      <template v-for="(item, key) in tableColumns">
        <el-table-column :key="key" :label="item">
          <template slot-scope="scope">
            <el-popover :key="key" trigger="click" placement="top" :title="scope.row.Name">
              <p>{{ scope.row.Description }}</p>
              <el-tag v-if="scope.row.Status==='Processing'">{{ scope.row.Status }}</el-tag>
              <el-tag v-else-if="scope.row.Status==='Completed'" type="success">{{ scope.row.Status }}</el-tag>
              <el-tag v-else-if="scope.row.Status==='Error'" type="danger">{{ scope.row.Status }}</el-tag>
              <router-link
                v-if="scope.row.Report.instanceUuid!=='undefined' && !scope.row.Report.isError"
                :to="{
                  name: 'Report Viewer',
                  params: {
                    instanceUuid: scope.row.Report.instanceUuid,
                    processUuid: scope.row.Report.processUuid,
                    fileName: scope.row.Report.output.fileName
                  }
                }"
              >
                <el-button type="text" icon="el-icon-printer">{{ 'See Report' }}</el-button>
              </router-link>
              <span slot="reference" type="text" class="name-wrapper">{{ scope.row[item] }}</span>
              <el-popover title="Log Info or Summary" trigger="click" style="max-width: 300px;">
                <template v-for="(log, index) in scope.row.Report.logs">
                  <div :key="index">
                    <span>{{ 'Log Message: ' }}</span>
                    <p>{{ log.log }}</p>
                  </div>
                </template>
                <span v-if="scope.row.Report.summary!==''">{{ 'Summary' }}</span>
                <p>{{ scope.row.Report.summary }}</p>
                <el-button v-if="scope.row.Report.instanceUuid==='undefined' && scope.row.Report.logs.length>0 || scope.row.Report.summary!==''" slot="reference" type="text">Logs</el-button>
              </el-popover>
            </el-popover>
          </template>
        </el-table-column>
      </template>
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
      return this.$store.getters.getRunningProcess
    },
    processListData() {
      var processListData = this.processRunnings.map((item) => {
        var reportInfo = {
          instanceUuid: 'undefined',
          processUuid: item.uuid,
          isError: false,
          summary: item.summary,
          resultTableId: 0,
          logs: item.logs,
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
          reportInfo = this.$store.getters.getCachedReport(item.instanceUuid)
          if (reportInfo.isError) {
            status = 'Error'
          } else {
            status = 'Completed'
          }
        } else {
          if (item.isError) {
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

  .name-wrapper {
    color: #409eff;
    cursor: pointer;
  }
</style>
