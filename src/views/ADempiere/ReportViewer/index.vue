<template>
  <div v-if="loading">
    <el-row :gutter="20">
      <el-col :span="12">
        <h3 class="text-center">{{ reportHeader }}</h3>
      </el-col>
      <el-col :span="12">
        <context-menu />
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <iframe v-if="reportFormatValue === 'pdf'" class="content" :src="pdfLink" />
        <div v-else-if="reportFormatValue === 'html'" class="content-html">
          <el-scrollbar wrap-class="scroll">
            <div v-html="reportContentValue" />
          </el-scrollbar>
        </div>
        <div v-else-if="reportFormatValue === 'txt'" class="content-txt">
          <el-scrollbar wrap-class="scroll">
            <pre v-text="reportContentValue" />
          </el-scrollbar>
        </div>
        <div v-else-if="reportFormatValue === 'xls' || reportFormatValue ==='xlsx'">
          <el-table :data="reportContentValue" border highlight-current-row class="content-excel">
            <pre>{{ reportContentValue }}</pre>
            <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item" />
          </el-table>
        </div>
      </el-col>
    </el-row>
    <modal
      :visible="visibleDialog"
      :metadata="reportResult"
      :parent-uuid="reportResult.processUuid"
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
      pdfLink: '',
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
        this.loading = true
      }
    },
    getCachedReport(instanceUuid) {
      this.reportResult = this.$store.getters.getCachedReport(instanceUuid)
      this.displayReport(this.reportResult)
    }
  }
}
</script>

<style scoped >
	.content{
		width: 100%;
		height: 500px;
		padding: 10px;
	}
	.content-html{
		width: 100%;
    padding: 10px;
	}
  .content-txt{
		width: 100%;
    padding: 10px;
	}
  .content-excel {
    width: 100%;
    margin-top:20px;
  }
</style>
