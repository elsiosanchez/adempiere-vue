<template>
  <div>
    <iframe v-if="reportFormat === 'pdf'" class="content" :src="pdfLink" />
    <div v-else-if="reportFormat === 'html'" class="content-html">
      <el-scrollbar wrap-class="scroll">
        <div v-html="reportContent" />
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportViewer',
  data() {
    return {
      pdfLink: require('@/assets/pdf/manual.pdf'),
      reportContent: `
			<table style="font-family:sans-serif">
				<thead>
					<tr class="">
						<th>Business Partner</th>
						<th>Currency</th>
						<th>Currency Type</th>
						<th>Date Invoiced</th>
						<th>Days Due</th>
						<th>Discount</th>
						<th>Discount Date</th>
						<th>Document No</th>
						<th>Due Date</th>
						<th>Grand Total</th>
						<th>Invoice</th>
						<th>Invoice Pay Schedule</th>
						<th>Net Days</th>
						<th>Open</th>
						<th>Order</th>
						<th>Paid</th>
						<th>Pay Schedule valid</th>
						<th>Sales Transaction</th>
						<th>Acct Date</th>
						<th>Activity</th>
						<th>Campaign</th>
						<th>Collection Status</th>
						<th>Description</th>
						<th>Payment Term</th>
						<th>Project</th>
						<th>Sales Rep</th>
					</tr>
				</thead>
				<tbody>
					<tr class="">
						<td style="">Joe Block</td>
						<td style="">EUR</td>
						<td style="">&nbsp;</td>
						<td style="">03/25/2019</td>
						<td style="">45</td>
						<td style="">0.00</td>
						<td style="">03/25/2019</td>
						<td style="">100000</td>
						<td style="">03/24/2019</td>
						<td style="">114.43</td>
						<td style="">100000 - 2019-03-25 00:00:00 - 228.85</td>
						<td style="">2019-03-25 00:00:00 - 114.43</td>
						<td style="">0</td>
						<td style="">114.43</td>
						<td style="">60000 - 2019-03-25 00:00:00</td>
						<td style="">0.00</td>
						<td style="">Y</td>
						<td style="">Y</td>
						<td style="">Mar 25, 2019 12:00:00 AM VET</td>
						<td style="">&nbsp;</td>
						<td style="">&nbsp;</td>
						<td style="">&nbsp;</td>
						<td style="">Export Order</td>
						<td style="">50% Immediate - 50% in 30 days</td>
						<td style="">&nbsp;</td>
						<td style="">GardenAdmin</td>
					</tr>
					<tr class="">
						<td style="">Joe Block</td>
						<td style="">EUR</td>
						<td style="">&nbsp;</td>
						<td style="">03/25/2019</td>
						<td style="">45</td>
						<td style="">0.00</td>
						<td style="">03/25/2019</td>
						<td style="">100000</td>
						<td style="">03/24/2019</td>
						<td style="">114.42</td>
						<td style="">100000 - 2019-03-25 00:00:00 - 228.85</td>
						<td style="">2019-03-25 00:00:00 - 114.42</td>
						<td style="">0</td>
						<td style="">114.42</td>
						<td style="">60000 - 2019-03-25 00:00:00</td>
						<td style="">0.00</td>
						<td style="">Y</td>
						<td style="">Y</td>
						<td style="">Mar 25, 2019 12:00:00 AM VET</td>
						<td style="">&nbsp;</td>
						<td style="">&nbsp;</td>
						<td style="">&nbsp;</td>
						<td style="">Export Order</td>
						<td style="">50% Immediate - 50% in 30 days</td>
						<td style="">&nbsp;</td>
						<td style="">GardenAdmin</td>
					</tr>
				</tbody>
			</table>`
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
	.content-html{
		width: 100%;
	}
</style>
