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
      <div v-if="this.$store.state.app.sidebar.opened">
        <el-button
          class="el-icon-arrow-down button-bottom"
          :circle="true"
          @click="showPanel = !showPanel"
        />
        <el-button
          class="el-icon-arrow-up button-up"
          :circle="true"
          @click="showPanel = !showPanel"
        />
        <div class="container-panel-open">
          <el-collapse-transition>
            <div v-show="showPanel">
              <tab-children
                :window-uuid="windowUuid"
                :tabs-list="windowMetadata.tabsListChildren"
              />
            </div>
          </el-collapse-transition>
        </div>
      </div>
      <div v-else-if="!this.$store.state.app.sidebar.opened">
        <div class="container-panel">
          <tab-children
            :window-uuid="windowUuid"
            :tabs-list="windowMetadata.tabsListChildren"
          />
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
      showPanel: false,
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
    transition: width 0.28s;
  }
  .container-panel-open {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 0;
    width: calc(100% - 200px);
    transition: width 0.28s;
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
    right: 50%;
    position: fixed;
  }
  .button-up {
    bottom: 0;
    z-index: 2;
    right: 50%;
    position: fixed;
  }
  .el-row {
    margin-bottom: 20px;
    border: 2px solid black;

  }

  .el-col {
    border-radius: 4px;
    border: 5px solid rgb(247, 0, 41);
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
