<template>
  <div v-if="a.length > 0" class="wrapper">
    <h3 class="warn-content text-center">
      Process Activity
    </h3>
    <el-table
      :data="a"
      :stripe="true"
      style="width: 100%"
    >
      <el-table-column
        prop="name"
        label="name"
      />
      <el-table-column
        prop="description"
        label="description"
      />
      <el-table-column
        prop="action"
        label="action"
      />
      <el-table-column
        label="see report"
      >
        <router-link :to="{ name: 'Report Viewer', params: { processUuid,instanceUuid,fileName } }"><svg-icon icon-class="clipboard" /></router-link>
      </el-table-column>
      <el-table-column
        label="Status"
      >
        <el-popover
          ref="popover"
          placement="right"
          title="Status"
          width="400"
          trigger="click"
          content="type : Report"
        />
        <el-button v-popover:popover type="text">detail of the process</el-button>
        <!-- {{ item.name }} -->
      </el-table-column>
    </el-table>
  </div>
  <div v-else class="errPage-container">
    <el-row>
      <el-col :span="8">.
      </el-col>
      <el-col :span="8">
        <h1>
          Oops! Not process running
        </h1>
        <img :src="errGif" width="313" height="428" alt="Girl has dropped her ice cream.">
      </el-col>
    </el-row>
  </div>
</template>
<script>
import errGif from '@/assets/401_images/401.gif'

export default {
  name: 'ProcessActivity',
  data() {
    return {
      errGif: errGif + '?' + +new Date(),
      tableData: [],
      showDialog: false
    }
  },
  computed: {
    processRunnings() {
      return this.$store.getters.getRunningProcess()
    },
    a() {
      var a = this.$store.getters.getRunningProcess().map((item) => {
        return {
          name: item.name,
          description: item.description,
          action: item.action,
          output: item.output,
          logs: item.logs,
          isError: item.isError
        }
      })
      return a
    }
  },
  created() {
    this.controlError()
  },
  methods: {
    controlError() {
      this.$store.subscribeAction({
        before: (action, state) => {
          if (action.type === 'startProcess') {
            this.$notify.info({
              title: 'Info',
              message: 'Processing ' + action.type
            })
          }
        },
        after: (action, state) => {
          if (action.type === 'startProcess') {
            this.$notify.error({
              title: 'Error',
              message: 'Error Processing ' + action.type
            })
          }
        }
      })
    }
  }
}
</script>
