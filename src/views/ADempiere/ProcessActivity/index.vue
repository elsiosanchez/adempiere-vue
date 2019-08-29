<template>
  <div v-if="processActivity.length > 0" class="app-container">
    {{ processActivity.name }}
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
            <span><b>{{ activity.action }}</b></span>
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
              <!-- <el-popover
              ref="popover"
              placement="right"
              title="Title"
              width="200"
              trigger="focus"
              content="this is content, this is content, this is content">
            </el-popover>
            <el-tag v-popover:popover :type="checkStatus(activity.isError, activity.isProcessing).type">{{ checkStatus(activity.isError).text }}</el-tag> -->
              <el-popover
                placement="right"
                width="auto"
                trigger="hover"
              >
                <div>
                  <span v-if="activity.isReport === false"><b>{{ $t('table.ProcessActivity.Logs') }}</b><br>{{ activity.logs }}</span>
                  <div v-else>
                    <span> <b>output</b></span><br>
                    <!-- <span> <b>{{ $t('table.ProcessActivity.Name') }}:</b>{{ activity.output }}</span><br> -->
                    <!-- <span><b>{{ $t('table.ProcessActivity.Description') }}:</b>{{ activity.output.description }}</span><br>
                    <span><b>{{ $t('table.ProcessActivity.FileName') }}:</b>{{ activity.output.fileName }}</span><br> -->
                    <!-- <span>{{ activity.url }}</span><br> -->
                  </div>
                </div>
                <el-tag slot="reference" :type="checkStatus(activity.isError, activity.isProcessing).type">{{ checkStatus(activity.isError).text }}</el-tag>
              </el-popover>
              <!-- <el-popover
                placement="top-start"
                title="Summary"
                width="200"
                trigger="hover"
                :content="activity.summary">
               <el-tag slot="reference" :type="checkStatus(activity.isError, activity.isProcessing).type">{{ checkStatus(activity.isError).text }}</el-tag>
              </el-popover> -->
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
import { isEmptyValue } from '@/utils/ADempiere'

export default {
  name: 'ProcessActivity',
  data() {
    return {
      processActivity: [],
      recordCount: 0
    }
  },
  beforeMount() {
    const initializedProcess = this.$store.getters.getInitializedProcess
    const resultProcess = this.$store.getters.getResult
    const finalProcessList = Object.assign(initializedProcess, resultProcess)
    this.processActivity = finalProcessList
    this.$store.dispatch('getSessionProcessFromServer')
      .then(response => {
        if (response.processList.length > 0) {
          this.processActivity = this.$store.getters.getInitializedProcess
          this.recordCount = response.processList.length
        }
      })
  },
  methods: {
    isEmptyValue,
    handleCommand(activity) {
      console.log(activity)
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
    checkStatus(isError, isProcessing) {
      var status = { text: '', type: '', color: '' }
      console.log('erro:', isError)
      console.log('isProcessing:', isProcessing)
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
