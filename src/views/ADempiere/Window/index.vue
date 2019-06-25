<template>
  <div v-if="isLoading">
    <el-row :gutter="20">
      <tab
        :window-uuid="windowUuid"
        :tabs-list="windowMetadata.tabsListParent"
        :is-edit="isEdit"
        class="tab-window"
      />
      <submenu class="sticky-submenu" />
      <modal
        :visible="isVisibleDialog"
        :metadata="processMetadata"
        :parent-uuid="windowUuid"
        :parent-panel="panelType"
        @closeDialog="isVisibleDialog=false"
      />
      <!-- <el-container>
        <el-main>
          <detail :show-detail="typeof windowMetadata.tabsListChildren != 'undefined' && windowMetadata.tabsListChildren.length > 0">
            <tab-children
              :window-uuid="windowUuid"
              :tabs-list="windowMetadata.tabsListChildren"
            />
          </detail>
        </el-main>
      </el-container> -->
      <!-- <el-col :span="24"> -->
      <!-- <detail :show-detail="typeof windowMetadata.tabsListChildren != 'undefined' && windowMetadata.tabsListChildren.length > 0">
          <tab-children
            :window-uuid="windowUuid"
            :tabs-list="windowMetadata.tabsListChildren"
          />
        </detail> -->
      <div v-if="typeof windowMetadata.tabsListChildren != 'undefined' && windowMetadata.tabsListChildren.length > 0">
        <div v-if="this.$store.state.app.device === 'mobile'">
          <div class="container">
            <div class="show">
              <el-button
                class="el-icon-arrow-up button-up btn"
                :circle="true"
                @click="handleChange()"
              />
            </div>
            <div class="container-panel-mobile">
              <el-collapse-transition>
                <div v-show="showPanel">
                  <el-button
                    class="el-icon-arrow-down button-bottom btn"
                    :circle="true"
                    @click="handleChange()"
                  />
                  <tab-children
                    :window-uuid="windowUuid"
                    :tabs-list="windowMetadata.tabsListChildren"
                  />
                </div>
              </el-collapse-transition>
            </div>
          </div>
        </div>
        <div v-else-if="this.$store.state.app.sidebar.opened">
          <div class="container">
            <div class="show">
              <el-button
                class="el-icon-arrow-up button-up btn"
                :circle="true"
                @click="handleChange()"
              />

            </div>
            <div class="container-panel-open">
              <el-collapse-transition>
                <div v-show="showPanel">
                  <el-button
                    class="el-icon-arrow-down button-bottom btn"
                    :circle="true"
                    @click="handleChange()"
                  />
                  <tab-children
                    :window-uuid="windowUuid"
                    :tabs-list="windowMetadata.tabsListChildren"
                  />
                </div>
              </el-collapse-transition>
            </div>
          </div>
        </div>
        <div v-else-if="!this.$store.state.app.sidebar.opened">
          <div class="container">
            <div class="show">
              <el-button
                class="el-icon-arrow-up button-up btn"
                :circle="true"
                @click="handleChange()"
              />
            </div>
            <div class="container-panel">
              <el-collapse-transition>
                <div v-show="showPanel">
                  <el-button
                    class="el-icon-arrow-down button-bottom btn"
                    :circle="true"
                    @click="handleChange()"
                  />
                  <tab-children
                    :window-uuid="windowUuid"
                    :tabs-list="windowMetadata.tabsListChildren"
                  />
                </div>
              </el-collapse-transition>
            </div>
          </div>
        </div>
      </div>
      <!-- </el-col> -->
    </el-row>
  </div>
  <div v-else style="padding: 20px 100px">
    <h3>
      Loading Window...
    </h3>
  </div>
</template>

<script>
import Tab from '@/components/ADempiere/Tab'
import TabChildren from '@/components/ADempiere/Tab/tabChildren'
// import Detail from '@/components/ADempiere/Panel/detail'
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import Submenu from '@/components/ADempiere/ContextMenu'
import Modal from '@/components/ADempiere/Dialog'
export default {
  name: 'Window',
  components: {
    Tab,
    TabChildren,
    // Detail,
    Submenu,
    Modal
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      windowMetadata: {},
      windowUuid: this.$route.meta.uuid,
      containerUuid: this.$route.meta.uuid,
      panelType: 'window',
      showPanel: true,
      isLoading: false,
      uuidRecord: this.$route.params.uuidRecord,
      isVisibleDialog: this.$store.state.processControl.visibleDialog,
      processMetadata: {}
    }
  },
  computed: {
    /**
     * DETERMINATE USED
     */
    getTabList() {
      return this.$store.getters.getTabsList(this.windowUuid)
    },
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  beforeCreate() {
    this.$store.subscribe(mutation => {
      if (mutation.type === 'setShowDialog') {
        if (typeof mutation.payload !== 'undefined') {
          this.isVisibleDialog = true
          this.processMetadata = mutation.payload
        }
      }
    })
  },
  beforeMount() {
    this.getWindow(this.windowUuid)
  },
  methods: {
    isMobileClassmenu() {
      const cssClass = 'container-submenu'
      if (this.device === 'mobile') {
        return cssClass + '-mobile'
      }
      return cssClass
    },
    handleChange() {
      this.showPanel = !this.showPanel
    },
    getWindow(uuid = null) {
      if (!uuid) {
        uuid = this.windowUuid
      }
      var window = this.$store.getters.getWindow(uuid)
      if (typeof window === 'undefined') {
        this.$store.dispatch('getWindowFromServer', uuid)
          .then(response => {
            this.windowMetadata = response
            this.isLoading = true
          })
          .catch(err => {
            this.isLoading = true
            console.warn('Dictionary Window - Error ' + err.code + ': ' + err.message)
          })
      } else {
        this.isLoading = true
        this.windowMetadata = window
      }
    }
  }
}
</script>

<style scoped >
.container {
    bottom: 0;
    right: 0;
    z-index: 0;
    width: calc(111% - 200px);
    transition: width 0.28s;
    position: fixed;
    height: 20px;
    display: flex;
    color: #424242;
}
	.show {
  position: absolute;
  bottom: 0;
  color: #FFF;
  width: 100%;
  height: 300px;
  transition: all 0.5s ease-in;
  display: flex;
}
.container-open {
    bottom: 0;
    right: 0;
    z-index: 0;
    width: 100%;
    transition: width 0.28s;
    position: fixed;
    height: 20px;
    display: flex;
    color: #424242;
}
	.show-open {
  position: absolute;
  bottom: 0;
  color: #FFF;
  width: 100%;
  height: 300px;
  transition: all 0.5s ease-in;
  display: flex;
}
  .container:hover .show{
    height: 30px;
  }
  .btn{
    animation-name: btn;
    position: relative;
    transition-delay: 0.6s;
    visibility: hidden;
    /* right: 50%; */
  }
  .container:hover .btn{
    visibility: visible;
  }
  .el-tabs__content {
    overflow: hidden;
    position: relative;
    padding-top: 0px;
    padding-left: 15px;
    padding-right: 15px;
}
  .btn-base :hover {
    box-shadow: 5px #5a5a5a;
  }
  .avatar {
    width: 54px;
    height: 28px;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 134px;
    height: 5px;
    line-height: 57px;
  }
  .tab-window {
    z-index: 9;
  }
  .container-panel {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 0;
    width: calc(100% - 54px);
    /* height: 40%; */
    transition: width 0.28s;
  }
  .container-panel-movil {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 0;
    width: 100%;
    height: 60%;
    transition: width 0.28s;
  }
  .container-panel-mobile {
    position: fixed;
    bottom: 0;
    /* height: calc(100% - (20px + 30px)); */
    right: 0;
    z-index: 0;
    width: 100%;
    transition: width 0.28s;
  }
  .container-panel-open {
    position: fixed;
    bottom: 0;
    /* height: calc(100% - (20px + 30px)); */
    right: 0;
    z-index: 0;
    width: calc(100% - 200px);
    transition: width 0.28s;
  }
  .container-up{
    right: 50%;
  }
  .show {
    position: absolute;
    bottom: 0;
    color: #FFF;
    width: 100%;
    height: 0px;
    transition: all 0.5s ease-in;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .button-bottom {
    bottom: 50%;
    z-index: 2;
    position: relative;
    margin: 0 auto;
    left: 47%;
  }
  .button-up {
    bottom: 0;
    position: relative;
    margin: 0 auto;
  }
  .btn-base {
    width: 40px;
    position: fixed;
    background: #ffffff;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    outline: 0;
    font-size: 14px;
  }
  .btn-base :hover {
    box-shadow: 5px #5a5a5a;
  }
  .el-row {
    margin-bottom: 20px;
    /* border: 2px solid black; */
  }
  .el-col {
    border-radius: 4px;
    /* border: 5px solid rgb(247, 0, 41); */
    left: 10px;
  }
  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    width: 100%;
    /* line-height: 160px;   */
  }
  .sticky-submenu {
    position: absolute !important;
    right: 10px;
    top: 0;
  }
</style>
