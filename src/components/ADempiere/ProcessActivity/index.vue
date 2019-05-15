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
      <!-- <template v-for="(item, index) in a"> -->
      <!-- <template v-for="(item, index) in a"> -->
      <el-table-column
        prop="name"
        label="name"
      >
        <!-- {{ item.name }} -->
      </el-table-column>
      <el-table-column
        prop="description"
        label="description"
      >
        <!-- {{ item.name }} -->
      </el-table-column>
      <!-- {{ item.name }} -->
      <el-table-column
        prop="action"
        label="action"
      >
        <!-- {{ item.name }} -->
      </el-table-column>
      <el-table-column
        label="see reporte"
      >
        <router-link :to="{ path: 'report-viewer' }"><svg-icon icon-class="clipboard" /></router-link>
        <!-- {{ item.name }} -->
      </el-table-column>
    </el-table>
  </div>
  <div v-else class="errPage-container">
    <el-row>
      <el-col :span="12">.
      </el-col>
      <el-col :span="12">
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
      tableData: []
    }
  },
  computed: {
    processRunnings() {
      return this.$store.getters.getRunningProcess()
    },
    processActions() {
      return this.$store.getters.getActionProcess()
    },
    a() {
      var a = this.$store.getters.getRunningProcess().map((item) => {
        // var b   = this.$store.getters.getActionProcess()
        return {
          name: item.name,
          description: item.description,
          action: item.action,
          output: item.output,
          logs: item.logs,
          isError: item.isError

          // help: item.help
        }
      })
      console.log(a)
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
            // console.log('hola' + action.name +''+ action.type)
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
