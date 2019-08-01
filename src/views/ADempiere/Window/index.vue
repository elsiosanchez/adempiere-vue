<template>
  <div v-if="isLoading" class="view-base">
    <el-container>
      <el-aside v-show="detail" width="500px">
        <search-window
          :tab-uuid="windowMetadata.currentTab.uuid"
          :window-uuid="windowUuid"
          :table-name="windowMetadata.currentTab.tableName"
        />
      </el-aside>
      <el-container>
        <el-header style="height: 20px;">
          <context-menu
            :menu-parent-uuid="$route.meta.parentUuid"
            :container-uuid="windowMetadata.currentTabUuid"
            :parent-panel="panelType"
            :modal-metadata="windowMetadata"
          />
          <el-button type="text" icon="el-icon-search" @click="seeDetail()" />
        </el-header>
        <el-main>
          <tab-parent
            :window-uuid="windowUuid"
            :tabs-list="windowMetadata.tabsListParent"
            class="tab-window"
          />
          <modal-dialog />
          <!-- <split-panel-bottom
            :show-detail="windowMetadata.tabsListChildren && windowMetadata.tabsListChildren.length > 0"
            :is-showed-detail="windowMetadata.isShowedDetail"
            :panel-type="panelType"
            :container-uuid="windowUuid"
          >
            <tab-children
              :window-uuid="windowUuid"
              :tabs-list="windowMetadata.tabsListChildren"
            />
          </split-panel-bottom> -->
          <el-button icon="el-icon-caret-top" circle style="position: fixed;bottom: 1%;" @click="show = !show" />
          <el-button v-show="show" icon="el-icon-caret-bottom" circle style="position: fixed;top: 32%;" @click="show = !show" />
          <div style="height: 100px;">
            <transition name="el-fade-in-linear">
              <div v-show="show" :class="classContainer()">
                <tab-children
                  :window-uuid="windowUuid"
                  :tabs-list="windowMetadata.tabsListChildren"
                />
              </div>
            </transition>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
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
// import SplitPanelBottom from '@/components/ADempiere/Panel/detail'
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import ContextMenu from '@/components/ADempiere/ContextMenu'
import ModalDialog from '@/components/ADempiere/Dialog'
// import splitPane from 'vue-splitpane'
import SearchWindow from '@/views/ADempiere/SearchWindow'

export default {
  name: 'Window',
  components: {
    TabParent,
    TabChildren,
    // SplitPanelBottom,
    SearchWindow,
    ContextMenu,
    ModalDialog
    // splitPane,
  },
  data() {
    return {
      windowMetadata: {},
      show: true,
      windowUuid: this.$route.meta.uuid,
      panelType: 'window',
      isLoading: false,
      detail: false,
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
    seeDetail() {
      this.detail = !this.detail
    },
    classContainer() {
      if (this.$store.state.app.device === 'mobile') {
        return 'transition-box'
      } else if (this.$store.state.app.sidebar.opened) {
        return 'transition-box-open'
      } else if (!this.$store.state.app.sidebar.opened) {
        return 'transition-box'
      }
      return 'transition-box'
    },
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
    }
  }
}
</script>

<style scoped>
  .transition-box {
    width: calc(100% - 95px);
    /* padding-right: 20%; */
    height: -webkit-fill-available;
    border-radius: 4px;
    position: fixed;
    top: 39%;
    color: #fff;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .transition-box-open {
    width: calc(100% - 288px);
    /* padding-right: 20%; */
    height: -webkit-fill-available;
    border-radius: 4px;
    position: fixed;
    top: 39%;
    color: #fff;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .contex-menu {
    height: 20px;
  }
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
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    width: 100%;
  }
  .el-aside {
    background-color: #ffffff;
    color: #333;
    text-align: center;
    line-height: 200px;
  }

  .el-main {
    background-color: #ffffff;
    color: #333;
    text-align: center;
  }
</style>
