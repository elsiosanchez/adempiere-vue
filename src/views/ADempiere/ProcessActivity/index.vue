<template>
  <div v-if="processActivity.length > 0" class="app-container">
    <el-timeline :reverse="true">
      <el-timeline-item
        v-for="(activity, index) in processActivity"
        :key="index"
        :timestamp="String(new Date())"
        placement="top"
        type="primary"
        size="large"
        :color="checkStatus(activity.isError, activity.isProcessing).color"
      >
        <el-card>
          <div slot="header" class="clearfix">
            <span><b>{{ activity.name }}</b></span>
            <div class="actions">
              <el-dropdown @command="handleCommand(activity)">
                <span class="el-dropdown-link">
                  {{ $t('components.contextMenuActions') }}<i class="el-icon-arrow-down el-icon--right" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-if="activity.isReport">{{ $t('views.seeReport') }}</el-dropdown-item>
                  <!-- TODO: add more actions -->
                  <el-dropdown-item>Other Action</el-dropdown-item>
                  <el-dropdown-item>Other Action</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <el-form label-position="top">
            <el-form-item :label="generateTitle('Description')">
              {{ activity.description }}
            </el-form-item>
            <el-form-item :label="generateTitle('Status')">
              <el-popover
                ref="popoverLog"
                placement="right"
                :title="activity.name + ' ' + generateTitle('Logs')"
                width="400"
                trigger="hover"
              >
                <el-scrollbar wrap-class="popover-scroll">
                  <ul>
                    <li v-for="(log, key) in activity.logs" :key="key">{{ log.log }}</li>
                  </ul>
                </el-scrollbar>
              </el-popover>
              <el-tag v-popover:popoverLog :type="checkStatus(activity.isError, activity.isProcessing).type">{{ checkStatus(activity.isError, activity.isProcessing).text }}</el-tag>
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
      processActivity: this.$store.getters.getInitializedProcess,
      recordCount: 0
    }
  },
  beforeMount() {
    this.$store.dispatch('getSessionProcessFromServer')
      .then(response => {
        this.processActivity = this.$store.getters.getRunningProcess
        this.recordCount = response.processList.length
      })
  },
  methods: {
    handleCommand(activity) {
      if (activity.isReport) {
        this.$router.push({
          name: 'Report Viewer',
          params: {
            processId: activity.id,
            instanceUuid: activity.instanceUuid,
            fileName: activity.output.fileName
          }
        })
      }
    },
    checkStatus(isError, isProcessing) {
      var status = { text: '', type: '', color: '' }
      if (isProcessing) {
        status.text = this.$t('notifications.processing')
        status.type = 'info'
        status.color = '#909399'
        return status
      }
      if (!isError) {
        status.text = this.$t('notifications.completed')
        status.type = 'success'
        status.color = '#67C23A'
        return status
      }
      if (isError) {
        status.text = this.$t('notifications.error')
        status.type = 'danger'
        status.color = '#F56C6C'
        return status
      }
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
