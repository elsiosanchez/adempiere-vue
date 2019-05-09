<template>
  <div class="header-message">
    <svg-icon class-name="message-icon" icon-class="message" @click="dialogVisible=true" />
    <el-dialog
      :visible.sync="dialogVisible"
      width="30%"
    >
      <h3 class="warn-content text-center">
        Proccess
      </h3>
      <table>
        <tr v-for="(item,index) in processesExecution" :key="index">
          <td>
            {{ item.name }}
          </td>
          <td>
            <!-- <el-button
            @click.native.prevent="deleteRow(index , processesExeccution)" type="text" size="small">
              Eliminar
            </el-button> -->
          </td>
        </tr>
      </table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Notification',
  data() {
    return {
      message: '',
      dialogVisible: false,
      actions: this.$store.getters.getActions(this.$route.meta.uuid),
      getRunningProcess: ''
    }
  },
  computed: {
    isDisabled() {
      if (this.processesList.length > 0) {
        return false
      }
      return true
    },
    processesExecution() {
      return this.$store.getters.getRunningProcess
    },
    isReport() {
      if (this.report === true) {
        return true
      }
      return false
    }
  },
  methods: {
    deleteRow(index) {
      this.$store.dispatch('deleteProcess')
    }
  }
}
</script>

<style lang="scss" scoped>
.header-message {
  font-size: 0 !important;

  .message-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }

  .header-message-select {
    font-size: 18px;
    transition: width 0.2s;
    width: 0;
    overflow: hidden;
    background: transparent;
    border-radius: 0;
    display: inline-block;
    vertical-align: middle;

    /deep/ .el-input__inner {
      border-radius: 0;
      border: 0;
      padding-left: 0;
      padding-right: 0;
      box-shadow: none !important;
      border-bottom: 1px solid #d9d9d9;
      vertical-align: middle;
    }
  }

  &.show {
    .header-message-select {
      width: 210px;
      margin-left: 10px;
    }
  }
}
</style>
