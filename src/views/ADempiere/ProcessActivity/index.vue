<template>
  <div v-if="processListData.length > 0" class="app-container">
    <h3 class="warn-content text-center">
      {{ $t('route.ProcessActivity') }}
    </h3>

    <el-table ref="dragTable" :data="processListData" :stripe="true" class="table" border>
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
                    processUuid: scope.row.Report.processUuid,
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
              <el-popover title="Log Info or Summary" trigger="click" style="max-width: 300px;">
                <template v-for="(log, index) in scope.row.Report.logs">
                  <div :key="index">
                    <span>{{ $t('views.logs') }}</span>
                    <p>{{ log.log }}</p>
                  </div>
                </template>
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
  <div v-else class="errPage-container">
    <el-row>
      <el-col :span="8">.
      </el-col>
      <el-col :span="8">
        <h1>
          {{ $t('views.noProcess') }}
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
      errGif: errGif + '?' + new Date(),
      tableColumns: ['Name', 'Description', 'Action', 'Status'],
      showDialog: false
    }
  },
  computed: {
    processRunnings() {
      return this.$store.getters.getRunningProcess
    },
    processListData() {
      var processListData = this.processRunnings.map(item => {
        var reportInfo = {
          instanceUuid: 'undefined',
          processUuid: item.uuid,
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
          Action: item.action,
          Status: status,
          Report: reportInfo
        }
      })
      return processListData
    }
  },
  mounted() {
    this.$store.dispatch('getSessionProcessFromServer')
  },
  methods: {
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
    },
    getProcess(uuid) {
      this.$store.dispatch('getProcessFromServer', {
        containerUuid: uuid
      })
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
</style>
