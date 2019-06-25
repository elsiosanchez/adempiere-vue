<template>
  <div v-if="loading">
    <context-menu
      :is-report="true"
      :last-parameter="$route.params.processUuid"
    />
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="content">
          <h3 class="text-center">{{ reportHeader }}</h3>
          <iframe v-if="reportFormatValue === 'pdf'" class="content-api" :src="url" />
          <div v-else-if="reportFormatValue === 'ps'|| reportFormatValue === 'xml'||reportFormatValue === 'pdf' ||reportFormatValue === 'txt' || reportFormatValue === 'ssv' || reportFormatValue === 'csv' || reportFormatValue === 'xls' || reportFormatValue === 'xlsx' || reportFormatValue === 'arxml'" class="content-api" :src="url" />
          <div v-else-if="reportFormatValue === 'html'" class="content-txt">
            <el-container style="height: -webkit-fill-available;width: 100%;padding-bottom: 140px;">
              <!-- <el-scrollbar wrap-class="scroll" style="bottom: -7%;"> -->
              <el-main style="padding: 0;">
                <div
                  class="el-table--striped el-table--border el-table--scrollable-y el-table--scrollable-x"
                  v-html="reportContentValue"
                />
              </el-main>
            </el-container>
            <!-- </el-scrollbar> -->
          </div>
        </div>
      </el-col>
    </el-row>
    <modal
      :visible="visibleDialog"
      :metadata="processMetadataValue"
      :parent-uuid="reportResult.processUuid"
      :report-export-type="reportFormat"
      @closeDialog="visibleDialog=false"
    />
  </div>
  <div v-else style="padding: 20px 100px">
    <h3>
      Loading Report...
    </h3>
  </div>
</template>

<script>
import ContextMenu from '@/components/ADempiere/ContextMenu'
import Modal from '@/components/ADempiere/Dialog'

export default {
  name: 'ReportViewer',
  components: {
    ContextMenu,
    Modal
  },
  data() {
    return {
      url: this.$store.getters.getProcessResult.url,
      name: [],
      reportFormat: '',
      reportContent: ``,
      reportHeader: '',
      tableData: [],
      tableHeader: [],
      loading: false,
      reportResult: {},
      visibleDialog: this.$store.state.processControl.visibleDialog
    }
  },
  computed: {
    reportFormatValue() {
      return this.reportFormat
    },
    reportContentValue() {
      return this.reportContent
    },
    processMetadataValue() {
      return this.$store.getters.getProcess(this.$route.params.processUuid)
    }
  },
  created() {
    this.getCachedReport(this.$route.params.instanceUuid)
  },
  mounted() {
    this.reloadContextMenu()
  },
  methods: {
    reloadContextMenu() {
      this.$store.dispatch('reloadContextMenu', {
        containerUuid: this.reportResult.processUuid
      })
    },
    displayReport(reportResult) {
      if (!this.isError) {
        this.reportFormat = reportResult.output.reportExportType
        this.reportContent = reportResult.output.output
        this.reportHeader = reportResult.output.name
        this.name = reportResult.output.fileName
        this.loading = true
      }
    },
    getCachedReport(instanceUuid) {
      this.reportResult = this.$store.getters.getCachedReport(instanceUuid)
      if (typeof this.reportResult === 'undefined') {
        this.$store.dispatch('getSessionProcessFromServer')
        this.reportResult = this.$store.getters.getSessionProcess(instanceUuid)
        this.displayReport(this.reportResult)
      } else {
        this.displayReport(this.reportResult)
      }
    }
  }
}
</script>

<style scoped >
	.content {
    width: 100%;
    height: -webkit-fill-available;
    padding: 10px;
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
    height: 100%;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
    padding-bottom: 160px;
	}
  .content-txt{
		width: 100%;
		height: 100%;
    /* padding: 10px; */
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
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
