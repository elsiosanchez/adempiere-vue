<template>
  <div v-if="getRunProcessAll.length > 0" class="app-container">
    <el-timeline :reverse="true">
      <el-timeline-item
        v-for="(activity, index) in getRunProcessAll"
        :key="index"
        :timestamp="!isEmptyValue(activity.timeInitialized) ? String(new Date(activity.timeInitialized)) : String(new Date())"
        placement="top"
        type="primary"
        size="large"
        :color="checkStatus(activity.isError, activity.isProcessing, activity.isReport).color"
      >
        <el-card>
          <div slot="header" class="clearfix">
            <span><b>{{ activity.name }}</b></span>
            <div class="actions">
              <el-dropdown v-if="activity.isReport" @command="handleCommand(activity)">
                <span class="el-dropdown-link">
                  {{ $t('components.contextMenuActions') }}<i class="el-icon-arrow-down el-icon--right" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-if="activity.isReport">{{ $t('views.seeReport') }}</el-dropdown-item>
                  <!-- TODO: add more actions -->
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <el-form label-position="top">
            <el-form-item :label="generateTitle('Description')">
              <span><b>{{ activity.description }}</b></span>
              <span v-if="activity.isReport">{{ activity.output.description }}</span>
              <span v-else> {{ activity.summary }} </span>
            </el-form-item>
            <el-form-item :label="generateTitle('Status')">
              <el-popover
                placement="right"
                width="700"
                trigger="hover"
              >
                <div>
                  <span v-if="activity.isReport === false">
                    <b>{{ $t('table.ProcessActivity.Logs') }}</b><br>
                    {{ activity.logs }}
                  </span>
                  <div v-else-if="activity.output">
                    <span><b>output</b></span><br>
                    <span><b>{{ $t('table.ProcessActivity.Name') }}:</b>{{ activity.output.name }}</span><br>
                    <span><b>{{ $t('table.ProcessActivity.Description') }}:</b>{{ activity.output.description }}</span><br>
                    <span><b>{{ $t('table.ProcessActivity.FileName') }}:</b>{{ activity.output.fileName }}</span><br>
                    <!-- <span>{{ activity.url }}</span><br> -->
                  </div>
                </div>
                <el-tag slot="reference" :type="checkStatus(activity.isError, activity.isProcessing, activity.isReport).type">
                  {{ checkStatus(activity.isError, activity.isProcessing, activity.isReport).text }}
                </el-tag>
              </el-popover>
            </el-form-item>
          </el-form>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
  <div v-else>
    <h1 class="text-center">{{ $t('views.noProcess') }}</h1>
  </div>
</template>

<script>
export default {
  name: 'ProcessActivity',
  data() {
    return {
      processActivity: [],
      recordCount: 0
    }
  },
  computed: {
    // process local not sent
    getterAllInExecution() {
      return this.$store.getters.getAllInExecution
    },
    // process local and send with response
    getterAllFinishProcess() {
      return this.$store.getters.getAllFinishProcess
    },
    // session process from server
    getterAllSessionProcess() {
      return this.$store.getters.getAllSessionProcess
    },
    // all process
    getRunProcessAll() {
      var processAll = this.getterAllInExecution.concat(this.getterAllFinishProcess, this.getterAllSessionProcess)
      var processAllReturned = []

      processAll.forEach(element => {
        var processMetadataReturned = {}
        var infoMetadata = this.getProcessMetadata(element.processUuid)
        if (!infoMetadata) {
          infoMetadata = {}
        }
        Object.assign(processMetadataReturned, element, infoMetadata)

        var indexRepeat = processAllReturned.findIndex(item => item.instanceUuid === element.instanceUuid && !this.isEmptyValue(element.instanceUuid))
        if (indexRepeat > -1) {
          // update attributes in exists process to return
          // Object.assign(processAllReturned[indexRepeat], processMetadataReturned)
          var other = Object.assign(processMetadataReturned, processAllReturned[indexRepeat])
          processAllReturned[indexRepeat] = other
          return
        }

        // add new process to show
        processAllReturned.push(processMetadataReturned)
      })

      return processAllReturned
    }
  },
  beforeMount() {
    this.$store.dispatch('getSessionProcessFromServer')
  },
  methods: {
    getProcessMetadata(uuid) {
      return this.$store.getters.getProcess(uuid)
    },
    handleCommand(activity) {
      if (activity.isReport) {
        this.$router.push({
          name: 'Report Viewer',
          params: {
            processId: activity.processId,
            instanceUuid: activity.instanceUuid,
            fileName: activity.output.fileName
          }
        })
      }
    },
    checkStatus(isError, isProcessing, isReport) {
      var status = {
        text: this.$t('notifications.completed'),
        type: 'success',
        color: '#67C23A'
      }
      if (isReport) {
        return status
      }
      // is executing
      if (isProcessing) {
        status.text = this.$t('notifications.processing')
        status.type = 'info'
        status.color = '#909399'
        return status
      }
      if (isError) {
        status.text = this.$t('notifications.error')
        status.type = 'danger'
        status.color = '#F56C6C'
        return status
      }
      // is completed
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

<style scoped>
  .el-popover {
    position: absolute;
    background: #FFFFFF;
    overflow: auto;
    min-width: 84px;
    border-radius: 4px;
    border: 1px solid #e6ebf5;
    padding: 12px;
    max-height: 174px;
    z-index: 2000;
    color: #606266;
    line-height: 1.4;
    text-align: justify;
    max-width: 600px;
    font-size: 14px;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    word-break: break-all;
}
  .loading-div {
    padding: 100px 100px;
    height: 100%;
  }
  .actions {
    float: right
  }
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
</style>

<style>
  .popover-scroll {
    max-height: 200px !important;
  }
</style>
