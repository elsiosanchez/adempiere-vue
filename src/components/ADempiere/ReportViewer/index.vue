<template>
  <div>
    <iframe v-if="reportFormat === 'pdf'" class="content" :src="pdfLink" />
    <div v-else-if="reportFormat === 'html'" class="content-html">
      <el-scrollbar wrap-class="scroll">
        <div v-html="reportContentValue" />
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportViewer',
  data() {
    return {
      pdfLink: require('@/assets/pdf/manual.pdf')
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
    htmlDecode(text) {
      var processMetadata = document.createElement('div')
      processMetadata.innerHTML = text
      return processMetadata.childNodes[0].nodeValue
    },
    subscribeChanges() {

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
	}
</style>
