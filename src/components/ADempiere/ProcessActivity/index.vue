<template>
  <div class="wrapper">
    <h3 class="warn-content text-center">
      Process Activity
    </h3>
    <el-popover
      placement="left-start"
      width="400"
      trigger="click"
    >
      <!-- <div>
        <p>{{ item.description }}</p>
      </div> -->
      <el-table
        slot="reference"
        :data="a"
        :stripe="true"
        style="width: 100%"
      >
        <!-- <template v-for="(item, index) in a"> -->
        <el-table-column
          width="400"
          prop="name"
          label="name"
        >
          <!-- {{ item.name }} -->
        </el-table-column>
        <el-table-column
          width="420"
          prop="description"
          label="description"
        >
          <!-- {{ item.name }} -->
        </el-table-column><el-table-column
          width="320"
          prop="action"
          label="action"
        >
          <!-- {{ item.name }} -->
        </el-table-column>
      </el-table>
    </el-popover>
  </div>
</template>
<script>
export default {
  name: 'ProcessActivity',
  data() {
    return {
      tableData: [{
      }],
      processRunning: this.$store.getters.getRunningProcess()
    }
  },
  computed: {
    processRunnings() {
      return this.$store.getters.getRunningProcess()
    },
    a() {
      var a = this.$store.getters.getRunningProcess().map((item) => {
        // var b   = this.$store.getters.getActionProcess()
        return {
          name: item.name,
          description: item.description,
          action: item.name
        }
      })
      console.log(a)
      return a
    }
  },
  created() {
    this.subscribeChanges()
  },
  methods: {
    subscribeChanges() {
      this.$store.subscribe(mutation => {
        if (mutation.type === 'startProcess') {
          this.actions = this.$store.getters.getActionProcess()
        }
      })
    }
  }
}
</script>
