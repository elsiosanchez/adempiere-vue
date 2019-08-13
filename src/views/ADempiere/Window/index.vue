<template>
  <el-container v-if="isLoading" style="height: 86vh; border: 1px solid #eee">
    <multipane v-if="!isMobile" class="vertical-panes" layout="vertical">
      <div v-show="isShowedRecordNavigation" class="pane" :style="{ minWidth: '10%', width: '80%', maxWidth: '100%' }">
        <div>
          <el-aside v-show="isShowedRecordNavigation" width="100%">
            <data-table
              :parent-uuid="windowUuid"
              :container-uuid="windowMetadata.currentTab.uuid"
              :table-name="windowMetadata.currentTab.tableName"
              :is-showed-panel-record="true"
              :is-parent="true"
            />
          </el-aside>
        </div>
      </div>
      <multipane-resizer />
      <div class="pane" :style="{ width: '100%', maxWidth: '100%' }">
        <div>
          <el-container style="height: 80vh;">
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
                    v-if="!isMobile"
                    v-show="!isShowedTabChildren"
                    icon="el-icon-caret-top"
                    class="open-table-detail"
                    circle
                    @click="handleChangeShowedTabChildren()"
                  />
                  <el-button
                    v-else
                    v-show="!isShowedTabChildren"
                    icon="el-icon-caret-top"
                    class="open-table-detail-mobile"
                    circle
                    @click="handleChangeShowedTabChildren()"
                  />
                </div>
              </div>
              <modal-dialog />
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
            <el-header
              v-if="isShowedTabChildren && windowMetadata.tabsListChildren && windowMetadata.tabsListChildren.length > 0"
              style="height: auto; padding-right: 35px !important"
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
              />
            </el-header>
          </el-container>
        </div>
      </div>
    </multipane>
    <div v-else>
      <el-aside v-show="!isShowedRecordNavigation" width="50%">
        <i
          style="float: left;color: #008fd3;padding: 10px;"
          class="el-icon-circle-close"
          @click="handleChangeShowedRecordNavigation()"
        />
        <data-table
          :parent-uuid="windowUuid"
          :container-uuid="windowMetadata.currentTab.uuid"
          :table-name="windowMetadata.currentTab.tableName"
          :is-showed-panel-record="true"
          :is-parent="true"
        />
      </el-aside>
      <el-container style="height: 80vh;">
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
                v-if="!isMobile"
                v-show="!isShowedTabChildren"
                icon="el-icon-caret-top"
                class="open-table-detail"
                circle
                @click="handleChangeShowedTabChildren()"
              />
              <el-button
                v-else
                v-show="!isShowedTabChildren"
                icon="el-icon-caret-top"
                class="open-table-detail-mobile"
                circle
                @click="handleChangeShowedTabChildren()"
              />
            </div>
          </div>
          <modal-dialog />
          <div class="small-4 columns">
            <div class="w">
              <div class="open-left" />
              <el-button
                v-show="isShowedRecordNavigation"
                :icon="isShowedRecordNavigation ? 'el-icon-caret-left' : 'el-icon-caret-right'"
                class="open-navegation"
                circle
                @click="handleChangeShowedRecordNavigation()"
              />
            </div>
          </div>

        </el-main>
        <el-header
          v-if="isShowedTabChildren && windowMetadata.tabsListChildren && windowMetadata.tabsListChildren.length > 0"
          style="height: auto; padding-right: 35px !important"
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
          />
        </el-header>
      </el-container>
    </div>
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
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import ContextMenu from '@/components/ADempiere/ContextMenu'
import ModalDialog from '@/components/ADempiere/Dialog'
import DataTable from '@/components/ADempiere/DataTable'
import { Multipane, MultipaneResizer } from 'vue-multipane'

export default {
  name: 'Window',
  components: {
    TabParent,
    TabChildren,
    ContextMenu,
    DataTable,
    Multipane,
    MultipaneResizer,
    ModalDialog
  },
  data() {
    return {
      windowMetadata: {},
      windowUuid: this.$route.meta.uuid,
      panelType: 'window',
      isLoading: false,
      uuidRecord: this.$route.params.uuidRecord,
      isShowedTabChildren: true,
      isShowedRecordNavigation: false
    }
  },
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
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
        this.isShowedRecordNavigation = this.windowMetadata.currentTab.isShowedRecordNavigation
        this.isShowedTabChildren = this.windowMetadata.isShowedDetail
        this.isLoading = true
      } else {
        this.$store.dispatch('getWindowFromServer', this.windowUuid)
          .then(response => {
            this.windowMetadata = response
            this.windowMetadata.panelType = this.panelType
            this.isShowedRecordNavigation = this.windowMetadata.currentTab.isShowedRecordNavigation
            this.isShowedTabChildren = this.windowMetadata.isShowedDetail
            this.isLoading = true
          })
          .catch(error => {
            this.isLoading = true
            console.warn('Dictionary Window - Error ' + error.code + ': ' + error.message)
          })
      }
    },
    handleChangeShowedRecordNavigation() {
      this.isShowedRecordNavigation = !this.isShowedRecordNavigation
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
    height: 100vh;
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
    flex: 1;
    flex-basis: auto;
    overflow: auto;
    height: 35vh;
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
