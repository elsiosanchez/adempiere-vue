<template>
  <div v-if="isLoading">
    <context-menu
      :menu-parent-uuid="$route.meta.parentUuid"
      :container-uuid="windowMetadata.currentTabUuid"
      :parent-panel="panelType"
    />
    <el-row :gutter="20">
      <tab
        :window-uuid="windowUuid"
        :tabs-list="windowMetadata.tabsListParent"
        :is-edit="isEdit"
        class="tab-window"
      />
      <modal
        :visible="isVisibleDialog"
        :metadata="processMetadata"
        :parent-uuid="windowUuid"
        :parent-panel="panelType"
        @closeDialog="isVisibleDialog=false"
      />
      <detail
        :show-detail="typeof windowMetadata.tabsListChildren != 'undefined' && windowMetadata.tabsListChildren.length > 0"
        :is-showed-detail="windowMetadata.isShowedDetail"
        :panel-type="panelType"
        :container-uuid="windowUuid"
      >
        <tab-children
          :window-uuid="windowUuid"
          :tabs-list="windowMetadata.tabsListChildren"
        />
      </detail>
    </el-row>
  </div>
  <div
    v-else
    v-loading="!isLoading"
    :element-loading-text="$t('notifications.loading')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
    style="padding: 100px 100px; heigth: 100%"
  />
</template>

<script>
import Tab from '@/components/ADempiere/Tab'
import TabChildren from '@/components/ADempiere/Tab/tabChildren'
import Detail from '@/components/ADempiere/Panel/detail'
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import ContextMenu from '@/components/ADempiere/ContextMenu'
import Modal from '@/components/ADempiere/Dialog'

export default {
  name: 'Window',
  components: {
    Tab,
    TabChildren,
    Detail,
    ContextMenu,
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

<style scoped>
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
</style>
