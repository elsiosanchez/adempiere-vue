<template>
  <el-container v-if="isLoading" class="view-base">
    <context-menu
      :menu-parent-uuid="$route.meta.parentUuid"
      :parent-uuid="windowUuid"
      :container-uuid="windowMetadata.currentTabUuid"
      :parent-panel="panelType"
      :modal-metadata="windowMetadata"
    />
    <br>
    <el-aside v-show="navigation" width="500px">
      <search-window
        :tab-uuid="windowMetadata.currentTab.uuid"
        :window-uuid="windowUuid"
        :table-name="windowMetadata.currentTab.tableName"
      />
      <el-button icon="el-icon-error" circle @click="logNavigation()" />
    </el-aside>
    <el-main>
      <el-row :gutter="20">
        <el-button icon="el-icon-search" circle @click="logNavigation()" />
        <tab-parent
          :window-uuid="windowUuid"
          :tabs-list="windowMetadata.tabsListParent"
          class="tab-window"
        />
        <modal-dialog />
        <!-- <navegation-record /> -->
        <split-panel
          :show-detail="windowMetadata.tabsListChildren && windowMetadata.tabsListChildren.length > 0"
          :is-showed-detail="windowMetadata.isShowedDetail"
          :panel-type="panelType"
          :container-uuid="windowUuid"
        >
          <tab-children
            :window-uuid="windowUuid"
            :tabs-list="windowMetadata.tabsListChildren"
          />
        </split-panel>
      </el-row>
    </el-main>
  </el-container>
  <div
    v-else
    v-loading="!isLoading"
    :element-loading-text="$t('notifications.loading')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
    class="loading-window"
  />
</template>

<script>
import TabParent from '@/components/ADempiere/Tab'
import TabChildren from '@/components/ADempiere/Tab/tabChildren'
import SplitPanel from '@/components/ADempiere/Panel/detail'
// import NavegationRecord from '@/components/ADempiere/Panel/navegationRecord'
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import ContextMenu from '@/components/ADempiere/ContextMenu'
import ModalDialog from '@/components/ADempiere/Dialog'
import SearchWindow from '@/views/ADempiere/SearchWindow'

export default {
  name: 'Window',
  components: {
    TabParent,
    TabChildren,
    SplitPanel,
    ContextMenu,
    // NavegationRecord,
    SearchWindow,
    ModalDialog
  },
  data() {
    return {
      windowMetadata: {},
      windowUuid: this.$route.meta.uuid,
      panelType: 'window',
      isLoading: false,
      navigation: false,
      uuidRecord: this.$route.params.uuidRecord
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
    logNavigation() {
      this.navigation = !this.navigation
      this.$store.dispatch('getObjectListFromCriteria', {
        containerUuid: this.windowUuid,
        tableName: this.windowMetadata.currentTab.tableName,
        /* query: `select * from ${this.windowMetadata.currentTab.tableName}` */
        whereClause: "IsActive = 'Y'"
      })
    }
  }
}
</script>

<style scoped>
  .view-base {
    height: 100%;
    min-height: calc(100vh - 84px);
  }

  .loading-window {
    padding: 100px 100px;
    height: 100%;
  }
  .el-tabs__content {
    overflow: hidden;
    position: relative;
    padding-top: 0px;
    padding-left: 15px;
    padding-right: 15px;
  }
  .tab-window {
    z-index: 9;
  }
  .el-row {
    margin-bottom: 20px;
  }

  .el-col {
    border-radius: 4px;
    left: 10px;
  }
  .el-main {
    background-color: #ffffff;
    color: #333;
    text-align: center;
    width: 100%;
  }
  aside {
    background: #ffffff;
    padding: 8px 24px;
    margin-bottom: 20px;
    z-index: 3;
    border-radius: 2px;
    display: block;
    line-height: 32px;
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    color: #2c3e50;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>
