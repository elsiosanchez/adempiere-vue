<template>
  <div v-if="serverProcessList.length > 0 || getProcessListData.length > 0" class="app-container">
    <h3 class="warn-content text-center">
      {{ $t('route.ProcessActivity') }}
    </h3>

    <el-table ref="dragTable" :data="(serverProcessList.length > 0) ? serverProcessList : getProcessListData" :stripe="true" class="table" border>
      <template v-for="(item, key) in tableColumns">
        <el-table-column :key="key" :label="generateTitle(item)">
          <template slot-scope="scope">
            <el-popover :key="key" trigger="click" placement="top" :title="scope.row.Name">
              <p>{{ scope.row.Description }}</p>
              <el-tag v-if="scope.row.Status==='Processing' || scope.row[item]==='Procesando'">{{ scope.row.Status }}</el-tag>
              <el-tag v-else-if="scope.row.Status==='Completed' || scope.row[item]==='Completado'" type="success">{{ scope.row.Status }}</el-tag>
              <el-tag v-else-if="scope.row.Status==='Error'" type="danger">{{ scope.row.Status }}</el-tag>
              <router-link
                v-if="scope.row.Report.instanceUuid!=='undefined' && !scope.row.Report.isError"
                :to="{
                  name: 'Report Viewer',
                  params: {
                    instanceUuid: scope.row.Report.instanceUuid,
                    processId: scope.row.Report.processId,
                    fileName: scope.row.Report.output.fileName
                  }
                }"
              >
                <el-button type="text" icon="el-icon-printer">{{ $t('views.seeReport') }}</el-button>
              </router-link>
              <br>
              <span v-if="scope.row[item]" slot="reference" class="name-wrapper">
                <el-tag v-if="scope.row[item]==='Completed' || scope.row[item]==='Completado'" slot="reference" type="success">
                  {{ scope.row[item] }}
                </el-tag>
                <el-tag v-else-if="scope.row[item]==='Error'" slot="reference" type="danger">
                  {{ scope.row[item] }}
                </el-tag>
                <el-tag v-else-if="scope.row[item]==='Processing' || scope.row[item]==='Procesando'" slot="reference" type="info">
                  {{ scope.row[item] }}
                </el-tag>
                <span v-else>{{ scope.row[item] }}</span>
              </span>
              <el-popover v-if="scope.row.Report.logs.length > 0 || scope.row.Report.summary!==''" :title="$t('views.logs')" trigger="click" style="max-width: 300px;">
                <el-scrollbar wrap-class="popover-scroll">
                  <template v-for="(log, index) in scope.row.Report.logs">
                    <div :key="index">
                      <p>{{ log }}</p>
                    </div>
                  </template>
                </el-scrollbar>
                <span v-if="scope.row.Report.summary!==''">{{ $t('views.summary') }}</span>
                <p>{{ scope.row.Report.summary }}</p>
                <el-button v-if="scope.row.Report.instanceUuid==='undefined' && scope.row.Report.logs.length>0 || scope.row.Report.summary!==''" slot="reference" type="text" icon="el-icon-document">{{ $t('views.log') }}</el-button>
              </el-popover>
            </el-popover>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
  <h1 v-else class="text-center">
    {{ $t('views.noProcess') }}
  </h1>
</template>
<script>
import Sortable from 'sortablejs'

export default {
  name: 'ProcessActivity',
  data() {
    return {
      tableColumns: ['Name', 'Description', 'Status'],
      showDialog: false,
      sortable: null,
      serverProcessList: [],
      oldprocessListData: [],
      newprocessListData: []
    }
  },
  computed: {
    initializedProcess() {
      return this.$store.getters.getInitializedProcess
    },
    processFinalized() {
      return this.$store.getters.getProcessFinalized
    },
    getProcessListData() {
      var processListData = this.initializedProcess.map(item => {
        var reportInfo = {
          instanceUuid: (item.instanceUuid !== undefined) ? item.instanceUuid : 'undefined',
          processUuid: item.uuid,
          processId: item.id,
          isError: item.isError,
          summary: (item.summary) ? item.summary : '',
          resultTableId: 0,
          logs: [],
          output: {
            isRootInsert: false,
            elm: {}
          }
        }
        return {
          Name: item.name,
          Description: item.description,
          Summary: '',
          Status: (item.isProcessing) ? this.$t('notifications.processing') : this.$t('notifications.error'),
          Report: reportInfo
        }
      })
      return processListData
    }
  },
  created() {
    this.$store.dispatch('getSessionProcessFromServer')
  },
  mounted() {
    // this.getList()
    this.processRunnings()
  },
  methods: {
    processRunnings() {
      var processRunnings
      this.$store.getters.getRunningProcess
        .then(response => {
          if (response.length > 0) {
            processRunnings = response.map(item => {
              var reportInfo = {
                instanceUuid: 'undefined',
                processUuid: item.uuid,
                processId: item.id,
                isError: false,
                summary: item.summary,
                resultTableId: 0,
                logs: item.logs,
                output: {
                  ...item.output,
                  isRootInsert: false,
                  elm: {}
                }
              }
              var status = this.checkStatus(item.isError)
              return {
                Name: item.name,
                Description: item.description,
                Summary: item.summary,
                Status: status,
                Report: reportInfo
              }
            })
            this.serverProcessList = processRunnings
            this.$forceUpdate()
          }
        })
    },
    async getList() {
      this.oldprocessListData = this.processListData.map(v => v.id)
      this.newprocessListData = this.oldprocessListData.slice()
      if (this.processListData.length > 0) {
        this.$nextTick(() => {
          this.setSort()
        })
      }
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
    checkStatus(isError) {
      var status = this.$t('notifications.processing')
      if (isError) {
        status = this.$t('notifications.error')
      } else {
        status = this.$t('notifications.completed')
      }
      return status
    },
    generateTitle(title) {
      const hasKey = this.$te('table.ProcessActivity.' + title)
      if (hasKey) {
        // $t :this method from vue-i18n, inject in @/lang/index.js
        const translatedTitle = this.$t('table.ProcessActivity.' + title)
        return translatedTitle
      }
      return title
    }
  }
}
</script>

<style>
  .table {
    width: 100%;
  }

  .name-wrapper {
    color: #409eff;
    cursor: pointer;
  }
  .popover-scroll {
    max-height: 200px
  }
</style>
