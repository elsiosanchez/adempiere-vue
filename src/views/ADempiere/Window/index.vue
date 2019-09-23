<template>
  <div v-if="isLoading">
    <el-container style="height: 86vh;">
      <el-main>
        <split-pane :min-percent="10" :default-percent="isMobile ? (isShowedRecordNavigation ? 100 : 0) : (isShowedRecordNavigation ? 50 : -1)" split="vertical">
          <template>
            <div slot="paneL" class="left-container">
              <el-aside v-show="isShowedRecordNavigation" width="100%">
                <i
                  v-if="isMobile"
                  class="el-icon-close"
                  style="position: fixed;padding-top: 15px; color: #000000;font-size: 121%;font-weight: 615!important;padding-left: 9px;"
                  @click="handleChangeShowedRecordNavigation()"
                />
                <data-table
                  :parent-uuid="windowUuid"
                  :container-uuid="windowMetadata.currentTab.uuid"
                  :table-name="windowMetadata.currentTab.tableName"
                  :is-showed-panel-record="true"
                  :is-parent="true"
                  :window-query="windowMetadata.currentTab.query"
                />
              </el-aside>
            </div>
          </template>
          <template slot="paneR">
            <el-container style="height: 86vh;">
              <Split direction="vertical" @onDrag="onDrag">
                <SplitArea :size="isShowedTabChildren ? 50 : 100" :style="isShowedTabChildren ? { overflow: 'auto'} : { overflow: 'hidden'}">
                  <el-header style="height: 39px;">
                    <context-menu
                      :menu-parent-uuid="$route.meta.parentUuid"
                      :parent-uuid="windowUuid"
                      :container-uuid="windowMetadata.currentTabUuid"
                      :panel-type="panelType"
                      :is-insert-record="getterCurrentTab.isInsertRecord"
                      :modal-metadata="windowMetadata"
                    />
                  </el-header>
                  <el-main :style="isShowedTabChildren ? { height: 'initial', overflow: 'auto'} : { height: 'initial', overflow: 'hidden'}">
                    <tab-parent
                      :window-uuid="windowUuid"
                      :tabs-list="windowMetadata.tabsListParent"
                      :window-type="windowMetadata.windowType"
                      class="tab-window"
                    />
                    <div class="small-4 columns">
                      <div class="wrapper">
                        <div
                          v-show="windowMetadata.tabsListChildren && windowMetadata.tabsListChildren.length > 0"
                          class="open-detail"
                        />
                        <el-button
                          v-if="windowMetadata.tabsListChildren && windowMetadata.tabsListChildren.length > 0 &&
                            (isMobile && !isShowedRecordNavigation || !isMobile)"
                          v-show="!isShowedTabChildren"
                          icon="el-icon-caret-top"
                          :class="isMobile ? 'open-table-detail-mobile' : 'open-table-detail'"
                          circle
                          @click="handleChangeShowedTabChildren()"
                        />
                      </div>
                    </div>
                    <modal-dialog
                      :parent-uuid="windowUuid"
                      :container-uuid="windowMetadata.currentTabUuid"
                    />
                    <div class="small-4 columns">
                      <div class="w">
                        <div class="open-left" />
                        <el-button
                          :icon="isShowedRecordNavigation ? 'el-icon-caret-left' : 'el-icon-caret-right'"
                          class="open-navegation"
                          circle
                          @click="handleChangeShowedRecordNavigation()"
                        />
                      </div>
                    </div>
                  </el-main>
                </SplitArea>
                <SplitArea v-show="isShowedTabChildren" :size="50">
                  <el-header
                    v-if="isShowedTabChildren && windowMetadata.tabsListChildren && windowMetadata.tabsListChildren.length > 0"
                    style="height: auto; padding-right: 35px !important;padding-bottom: 33px;"
                  >
                    <div class="w-33">
                      <div class="center">
                        <el-button
                          icon="el-icon-caret-bottom"
                          circle
                          @click="handleChangeShowedTabChildren()"
                        />
                      </div>
                    </div>
                    <tab-children
                      :window-uuid="windowUuid"
                      :tabs-list="windowMetadata.tabsListChildren"
                      :style="{'height':getHeightPanelBottom+'vh'}"
                    />
                  </el-header>
                </SplitArea>
              </Split>
            </el-container>
          </template>
        </split-pane>
      </el-main>
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
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import ContextMenu from '@/components/ADempiere/ContextMenu'
import ModalDialog from '@/components/ADempiere/Dialog'
import DataTable from '@/components/ADempiere/DataTable'
import splitPane from 'vue-splitpane'

export default {
  name: 'Window',
  components: {
    TabParent,
    TabChildren,
    ContextMenu,
    DataTable,
    splitPane,
    ModalDialog
  },
  data() {
    return {
      windowMetadata: {},
      windowUuid: this.$route.meta.uuid,
      panelType: 'window',
      isLoading: false,
      isLoadingFromServer: false,
      listRecordNavigation: 0,
      isShowedTabChildren: true,
      isShowedRecordNavigation: false
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    getterIsShowedRecordNavigation() {
      return this.$store.getters.getIsShowedRecordNavigation(this.windowUuid)
    },
    getterWindow() {
      return this.$store.getters.getWindow(this.windowUuid)
    },
    getHeightPanelTop() {
      return this.$store.getters.getSplitHeightTop
    },
    getHeightPanelBottom() {
      return this.$store.getters.getSplitHeight - 15
    },
    getterRecordList() {
      return this.$store.getters.getDataRecordsList(this.windowMetadata.currentTabUuid).length
    },
    getterCurrentTab() {
      return this.$store.getters.getCurrentTab(this.windowUuid)
    }
  },
  watch: {
    isShowedRecordNavigation(value) {
      this.changeShowedRecordNavigation()
    },
    isLoadingFromServer(value) {
      if (value) {
        this.windowMetadata = this.getterWindow
        if (this.getterIsShowedRecordNavigation === undefined) {
          this.listRecordNavigation = this.getterRecordList
          if (this.windowMetadata.windowType === 'Q' || this.windowMetadata.windowType === 'M' && this.listRecordNavigation >= 10) {
            this.isShowedRecordNavigation = true
          } else if (this.windowMetadata.windowType === 'T') {
            this.isShowedRecordNavigation = false
          }
        } else {
          this.isShowedRecordNavigation = this.getterIsShowedRecordNavigation
        }

        this.isShowedTabChildren = this.windowMetadata.isShowedDetail
        this.isLoading = true
      }
    }
  },
  mounted() {
    this.getWindow()
  },
  methods: {
    // callback new size
    onDrag(size) {
      var bottomPanel = size[1]
      var topPanel = size[0]
      this.$store.dispatch('setSplitHeightTop', {
        splitHeightTop: topPanel
      })
      this.$store.dispatch('setSplitHeight', {
        splitHeight: bottomPanel
      })
    },
    // get window from vuex store or server
    getWindow() {
      if (this.getterWindow) {
        this.isLoadingFromServer = true
      } else {
        this.$store.dispatch('getWindowFromServer', this.windowUuid)
          .then(response => {
            this.isLoadingFromServer = true
          })
          .catch(error => {
            this.isLoading = true
            console.warn('Dictionary Window - Error ' + error.code + ': ' + error.message)
          })
      }
    },
    handleChangeShowedRecordNavigation(value) {
      this.isShowedRecordNavigation = !this.isShowedRecordNavigation
    },
    changeShowedRecordNavigation() {
      this.$store.dispatch('changeShowedRecordWindow', {
        parentUuid: this.windowUuid,
        containerUuid: this.windowMetadata.currentTab.uuid, // act as parentUuid
        isShowedRecordNavigation: this.isShowedRecordNavigation
      })
    },
    handleChangeShowedTabChildren() {
      this.isShowedTabChildren = !this.isShowedTabChildren
      this.$store.dispatch('changeShowedDetail', {
        panelType: this.panelType,
        containerUuid: this.windowUuid, // act as parentUuid
        isShowedDetail: this.isShowedTabChildren
      })
    }
  }
}
</script>

<style scoped>
  .el-tabs__content {
    overflow: hidden;
    position: relative;
    padding-top: 0px !important;
    padding-right: 15px !important;
    padding-bottom: 0px !important;
    padding-left: 15px !important;
  }
  .el-header {
    background-color: #fff;
    color: #333;
    line-height: 21px;
  }

  .el-aside {
    height: 100%;
    color: #333;
    overflow-y: auto;
    overflow-x: hidden;
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
    flex: 1;
    flex-basis: auto;
    overflow: hidden;
    height: 90vh;
    box-sizing: border-box;
    padding-top: 0px !important;
    padding-right: 0px !important;
    padding-bottom: 0px !important;
    padding-left: 0px !important;
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
  .open-table-detail-mobile {
    position: absolute;
    right: 50%;
    bottom: 4%;
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
.vertical-panes {
  width: 100%;
  height: 85vh;
  border: 1px solid #ccc;
}
.vertical-panes > .pane {
  text-align: left;
  padding: 15px;
  overflow: hidden;
  background: #fff;
}
.vertical-panes > .pane ~ .pane {
  border-left: 1px solid #ccc;
}
.loading-window {
  padding: 100px 100px;
  height: 100%;
}
</style>
<style>
  .el-card__header {
    background: rgba(245, 247, 250, 0.75);
    padding: 18px 20px;
    border-bottom: 1px solid #f5f7fa;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .split {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    overflow-y: hidden;
    overflow-x: hidden;
    height: 102%;
    width: 100%;
  }
  .components-container {
    position: relative;
    height: 100vh;
  }

  .left-container {
    background-color: #ffffff;
    height: 100%;
  }

  .right-container {
    background-color: #ffffff;
    height: 200px;
  }

  .top-container {
    background-color: #ffffff;
    width: 100%;
    height: 100%;
  }

  .bottom-container {
    width: 100%;
    background-color: #95E1D3;
    height: 100%;
  }
  .splitter-pane-resizer.vertical {
    width: 9px !important;
    height: 100%;
    margin-left: -10px;
    border-left: 5px solid hsla(0,0%,100%,0);
    border-right: 5px solid hsla(0,0%,100%,0);
    cursor: col-resize;
}
.splitter-pane.vertical.splitter-paneR {
    position: absolute;
    right: 0;
    height: 100%;
    padding-left: 10px;
}
</style>
