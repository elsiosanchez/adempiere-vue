<template>
  <div v-if="isLoading">
    <context-menu
      :container-uuid="reportResult.processUuid"
      :panel-type="panelType"
      :is-report="true"
      :last-parameter="reportResult.processUuid"
      :report-format="reportFormat"
    />
    <el-row type="flex" style="min-height: inherit;">
      <el-col :span="24">
        <div class="content">
          <h3 class="text-center">
            <el-popover
              v-if="!isEmptyValue(processMetadataValue.help)"
              placement="top-start"
              :title="processMetadataValue.name"
              width="400"
              trigger="hover"
            >
              <div v-html="processMetadataValue.help" />
              <el-button slot="reference" type="text" class="title">{{ processMetadataValue.name }}</el-button>
            </el-popover>
          </h3>
          <iframe v-if="reportFormat === 'pdf'" class="content-api" :src="url" width="100%" height="100%" />
          <div v-else-if="collectionReportFormat.includes(reportFormat)" class="content-api" :src="url" />
          <div v-else-if="reportFormat === 'html'" class="content-txt">
            <el-container style="width: 100%;padding-bottom: 140px;">
              <el-main style="padding: 0;">
                <div
                  class="el-table--striped el-table--border el-table--scrollable-y el-table--scrollable-x"
                  v-html="reportContent"
                />
              </el-main>
            </el-container>
          </div>
        </div>
      </el-col>
    </el-row>
    <modal
      :visible="visibleDialog"
      :metadata="processMetadataValue"
      :parent-uuid="reportResult.processUuid"
      :report-export-type="reportFormat"
      :panel-type="panelType"
      @closeDialog="visibleDialog=false"
    />
  </div>
  <div
    v-else
    v-loading="!isLoading"
    :element-loading-text="$t('notifications.loading')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
    class="loading-report-viewer"
  />
</template>

<script>
import ContextMenu from '@/components/ADempiere/ContextMenu'
import Modal from '@/components/ADempiere/Dialog'
import { isEmptyValue } from '@/utils/ADempiere/valueUtil'
import { showNotification } from '@/utils/ADempiere/notification'

export default {
  name: 'ReportViewer',
  components: {
    ContextMenu,
    Modal
  },
  data() {
    return {
      panelType: 'process',
      url: this.$store.getters.getProcessResult.url,
      name: [],
      reportFormat: '',
      collectionReportFormat: [
        'ps',
        'xml',
        'pdf',
        'txt',
        'ssv',
        'csv',
        'xls',
        'xlsx',
        'arxml'
      ],
      reportContent: '',
      reportHeader: '',
      tableData: [],
      tableHeader: [],
      isLoading: false,
      reportResult: {},
      visibleDialog: this.$store.state.processControl.visibleDialog
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    processMetadataValue() {
      return this.$store.getters.getProcessById(this.$route.params.processId)
    },
    getterCachedReport() {
      return this.$store.getters.getCachedReport(this.$route.params.instanceUuid)
    }
  },
  mounted() {
    this.getCachedReport()
  },
  methods: {
    isEmptyValue,
    showNotification,
    displayReport(reportResult) {
      if (!reportResult.isError) {
        this.reportFormat = reportResult.output.reportExportType
        this.reportContent = reportResult.output.output
        this.reportHeader = reportResult.output.name
        this.name = reportResult.output.fileName
        this.isLoading = true
      }
    },
    getCachedReport() {
      this.reportResult = this.getterCachedReport
      if (this.reportResult === undefined) {
        this.$store.dispatch('getSessionProcessFromServer')
          .then(response => {
            this.reportResult = this.getterCachedReport
            if (this.reportResult === undefined) {
              this.showNotification({
                type: 'error',
                title: 'error',
                message: 'requestError'
              })

              this.$store.dispatch('tagsView/delView', this.$route)
                .then(({ visitedViews }) => {
                  this.$router.push('/')
                })
              return
            }
            this.displayReport(this.reportResult)
          })
          .catch(error => {
            console.log(error)
          })
      } else {
        this.displayReport(this.reportResult)
      }
    }
  }
}
</script>

<style scoped >
  .loading-report-viewer {
    padding: 100px 100px;
    height: 100%;
  }

  .title {
    color: #000000;
    text-size-adjust: 20px;
    font-size: 100%;
    font-weight: 605!important;
  }
	.content {
    width: 100%;
    height: -webkit-fill-available;
    padding: 20px;
    position: absolute;
    top: 0%;
  }
	.content-html {
		width: 100%;
    height: 100%;
    padding: 10px;
	}
  .content-api {
		width: 100%;
    height: 84%;
    padding-right: 10px;
    padding-bottom: 1%;
	}
  .content-txt {
		width: 100%;
		height: 100%;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 0px;
    padding-bottom: 20px;
	}
  .content-excel {
    width: 100%;
    margin-top:20px;
  }
  .container{
    width: 200%;
    /* left: 50%; */
  }
  .container-report {
    width: 100%;
  }
  .scroll {
    max-height: -webkit-fill-available;
  }
</style>
