<template>
  <div>
    <iframe v-if="reportFormat === 'pdf'" class="content" :src="pdfLink" />
    <div v-else-if="reportFormat === 'html'" class="content-html">
      <el-scrollbar wrap-class="scroll">
        <div v-html="reportContentValue" />
      </el-scrollbar>
    </div>
    <div v-else-if="reportFormat === 'txt'" class="content-txt">
      <el-scrollbar wrap-class="scroll">
        <pre v-text="reportContentValue" />
      </el-scrollbar>
    </div>
    <div v-else-if="reportFormat === 'xls' || reportFormat ==='xlsx'">
      <!--<el-table :data="reportContentValue" border highlight-current-row class="content-excel">
        <pre>{{ reportContentValue }}</pre>
        <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item" />
      </el-table>-->
      {{ reportFormat + reportContentValue }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportViewer',
  data() {
    return {
      pdfLink: require('@/assets/pdf/manual.pdf'),
      tableData: [],
      tableHeader: []
    }
  },
  computed: {
    reportFormat() {
      return this.$store.state.processControl.reportFormat
    },
    reportContentValue() {
      return this.$store.state.processControl.reportContent
    }
  },
  methods: {
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
