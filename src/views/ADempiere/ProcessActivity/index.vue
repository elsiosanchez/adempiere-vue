<template>
  <div v-if="processListData.length > 0" class="wrapper">
    <h3 class="warn-content text-center">
      Process Activity
      <!-- {{ processListData }} -->
    </h3>
    <el-table ref="dragTable" :data="processListData" :stripe="true" class="table">
      <template v-for="(item, key) in tableColumns">
        <el-table-column :key="key" :label="item">
          <template slot-scope="scope">
            <!-- <span>{{ scope.row[item] }}</span> -->
            <el-popover :key="key" trigger="click" placement="top">
              <p>Name: {{ scope.row.Name }}</p>
              <p>Statu: {{ scope.row.Status }}</p>
              <p>isError: {{ scope.row.Report.isError }}</p>
              <p>summary: {{ scope.row.Report.summary }}</p>
              <p>resultTableId: {{ scope.row.Report.resultTableId }}</p>
              <p>logs: {{ scope.row.Report.logs }}</p>
              <!-- <p>output: {{ scope.row.Report.output.output }}</p> -->
              <div slot="reference" class="name-wrapper">
                <el-button type="text"> {{ scope.row[item] }} </el-button>
              </div>
            </el-popover>
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
import Sortable from 'sortablejs'

export default {
  name: 'ProcessActivity',
  data() {
    return {
      errGif: errGif + '?' + +new Date(),
      tableColumns: ['Name', 'Description', 'Action', 'Status'],
      showDialog: false,
      sortable: null,
      oldprocessListData: [],
      newprocessListData: [],
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
  },
  created() {
    this.controlError()
    this.getList()
  },
  methods: {
    async getList() {
      this.oldprocessListData = this.processListData.map(v => v.id)
      this.newprocessListData = this.oldprocessListData.slice()
      this.$nextTick(() => {
        this.setSort()
      })
    },
    setSort() {
      const el = this.$refs.dragTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost', // Class name for the drop placeholder,
        setData: function(dataTransfer) {
          // to avoid Firefox bug
          // Detail see : https://github.com/RubaXa/Sortable/issues/1012
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.processListData.splice(evt.oldIndex, 1)[0]
          this.processListData.splice(evt.newIndex, 0, targetRow)

          // for show the changes, you can delete in you code
          const tempIndex = this.newprocessListData.splice(evt.oldIndex, 1)[0]
          this.newprocessListData.splice(evt.newIndex, 0, tempIndex)
        }
      })
    },
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
            this.$notify.info({
              title: 'Info',
              message: ' Processing ' + action.type
            })
          }
        }
      })
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
