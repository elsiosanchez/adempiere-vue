<template>
  <div>
    <iframe v-if="reportFormat === 'pdf'" class="content" :src="pdfLink" />
    <code v-else-if="reportFormat === 'html'" v-html="reportContent" />
  </div>
</template>

<script>
export default {
  name: 'ReportPreview',
  data() {
    return {
      pdfLink: require('@/assets/pdf/manual.pdf'),
      reportContent: `<!DOCTYPE html>
													<html lang="en">
													<head>
															<meta charset="UTF-8">
															<meta name="viewport" content="width=device-width, initial-scale=1.0">
															<meta http-equiv="X-UA-Compatible" content="ie=edge">
															<title>Document</title>
													</head>
													<body>
															<h1>Insert HTML code</h1>
													</body>
													</html>`
    }
  },
  computed: {
    reportFormat() {
      return this.$store.state.contextMenu.reportFormat
    }
  },
  methods: {
    htmlDecode(text) {
      var processMetadata = document.createElement('div')
      processMetadata.innerHTML = text
      return processMetadata.childNodes[0].nodeValue
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
</style>
