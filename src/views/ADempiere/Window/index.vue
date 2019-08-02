<template>
  <el-container v-if="isLoading" style="height: 86vh; border: 1px solid #eee">
    <el-aside v-show="recordNavigation" width="30%">
      <data-table
        :window-uuid="windowUuid"
        :parent-uuid="windowUuid"
        :container-uuid="windowMetadata.currentTab.uuid"
        :table-name="windowMetadata.currentTab.tableName"
      />
    </el-aside>

    <el-container>
      <el-header style="height: 40px;">
        <context-menu
          :menu-parent-uuid="$route.meta.parentUuid"
          :parent-uuid="windowUuid"
          :container-uuid="windowMetadata.currentTabUuid"
          :parent-panel="panelType"
          :modal-metadata="windowMetadata"
        />
      </el-header>

      <el-main>
        <tab-parent
          :window-uuid="windowUuid"
          :tabs-list="windowMetadata.tabsListParent"
          class="tab-window"
        />
        <div class="small-4 columns">
          <div class="wrapper">
            <div
              v-show="windowMetadata.tabsListChildren && windowMetadata.tabsListChildren.length > 0"
              class="open-detail"
            />
            <el-button
              v-show="!panelDetail"
              icon="el-icon-caret-top"
              class="open-table-detail"
              circle
              @click="panelDetail = !panelDetail"
            />
          </div>
        </div>
        <modal-dialog />
        <div class="small-4 columns">
          <div class="w">
            <div class="open-left" />
            <el-button
              icon="el-icon-caret-right"
              class="open-navegation"
              circle
              @click="logNavigation()"
            />
          </div>
        </div>
      </el-main>
      <el-header
        v-if="panelDetail && windowMetadata.tabsListChildren && windowMetadata.tabsListChildren.length > 0"
        style="height: auto;"
      >
        <div class="w-33">
          <div class="center">
            <el-button
              icon="el-icon-caret-bottom"
              circle
              @click="panelDetail = !panelDetail"
            />
          </div>
        </div>
        <tab-children
          :window-uuid="windowUuid"
          :tabs-list="windowMetadata.tabsListChildren"
        />
      </el-header>
    </el-container>
  </el-container>
  <div
    v-else
    v-loading="!isLoading"
    :element-loading-text="$t('notifications.loading')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
    class="loading-browser"
  />
</template>

<script>
import TabParent from '@/components/ADempiere/Tab'
import TabChildren from '@/components/ADempiere/Tab/tabChildren'
// import SplitPanel from '@/components/ADempiere/Panel/detail'
// import NavegationRecord from '@/components/ADempiere/Panel/navegationRecord'
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import ContextMenu from '@/components/ADempiere/ContextMenu'
import ModalDialog from '@/components/ADempiere/Dialog'
// import SearchWindow from '@/views/ADempiere/SearchWindow'
import DataTable from '@/components/ADempiere/DataTable'

export default {
  name: 'Window',
  components: {
    TabParent,
    TabChildren,
    // SplitPanel,
    ContextMenu,
    // NavegationRecord,
    // SearchWindow,
    DataTable,
    ModalDialog
  },
  data() {
    return {
      windowMetadata: {},
      windowUuid: this.$route.meta.uuid,
      panelType: 'window',
      isLoading: false,
      uuidRecord: this.$route.params.uuidRecord,
      panelDetail: true,
      recordNavigation: false
    }
  },
  computed: {
    getterWindow() {
      return this.$store.getters.getWindow(this.windowUuid)
    }
  },
  created() {
    this.getWindow()
  },
  methods: {
    getWindow() {
      var window = this.getterWindow
      if (window) {
        this.windowMetadata = window
        this.windowMetadata.panelType = this.panelType
        this.isLoading = true
      } else {
        this.$store.dispatch('getWindowFromServer', this.windowUuid)
          .then(response => {
            this.windowMetadata = response
            this.windowMetadata.panelType = this.panelType
            this.isLoading = true
          })
          .catch(error => {
            this.isLoading = true
            console.warn('Dictionary Window - Error ' + error.code + ': ' + error.message)
          })
      }
    },
    /**
     * TODO: Check usage, observe the getData() function in the parentTab
     */
    logNavigation() {
      this.recordNavigation = !this.recordNavigation
      if (this.recordNavigation) {
        var tab = this.windowMetadata.currentTab

        this.$store.dispatch('getDataListTab', {
          parentUuid: this.windowUuid,
          containerUuid: tab.uuid
        })
      }
    }
  }
}
</script>

<style scoped>
  .el-header {
    background-color: #fff;
    color: #333;
    line-height: 21px;
  }

  .el-aside {
    color: #333;
  }
  aside {
    background: #fff;
    padding: 0px;
    margin-bottom: 0px;
    border-radius: 2px;
    display: block;
    line-height: 32px;
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    color: #2c3e50;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .el-main {
    display: block;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    -ms-flex-preferred-size: auto;
    flex-basis: auto;
    overflow: auto;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding-top: 0px;
    padding-right: 20px;
    padding-bottom: 0px;
    padding-left: 20px;
  }
  .center{
    text-align: center;
  }
  .close{
    text-align: right;
  }
  .w-33 {
    width: 100%;
    background-color: transparent;
  }
  .open-table-detail {
    position: absolute;
    right: 50%;
    bottom: 4%;
    display: none;
  }
  .open-navegation {
    position: fixed;
    top: 50%;
    display: none;
    z-index: 3;
  }
  .button {
    display: none;
  }
  .wrapper:hover .open-table-detail {
    display: inline-block;
  }
  .w:hover .open-navegation {
    display: inline-block;
  }
  .open-detail {
    width: 100%;height: 20px;
    position: absolute;bottom: 5%;
  }
  .open-left {
    width: 4%;height: 95%;
    position: absolute;top: 2%;
  }
  .el-button {
    cursor: pointer;
    background: #FFFFFF;
    border: 1px solid #DCDFE6;
    border-color: #DCDFE6;
    color: white;
    background: #008fd3;
  }
</style>
