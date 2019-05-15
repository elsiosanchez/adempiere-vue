<template>
  <div class="wrapper">
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
      </el-table-column><el-table-column
        prop="action"
        label="action"
      >
        <!-- {{ item.name }} -->
      </el-table-column>
      <el-table-column
        prop="action"
        label="action"
      >
        <router-link :to="{ path: 'report-viewer' }"><svg-icon icon-class="clipboard" /></router-link>
        <!-- {{ item.name }} -->
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'ProcessActivity',
  data() {
    return {
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
          action: item.action
        }
      })
      console.log(a)
      return a
    }
  },
  methods: {
    subscribeChanges() {
      this.$store.subscribe(mutation => {
        if (mutation.type === 'startProcess') {
          this.actions = this.$store.getters.getProcess(mutation.payload.containerUuid)
          console.log(this.$store.getters.getProcess(mutation.payload.containerUuid))
          return this.actions
        }
      })
    }
  }
}
</script>
