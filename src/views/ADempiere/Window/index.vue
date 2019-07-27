<template>
  <div v-if="isLoading" class="view-base">
    <context-menu
      :menu-parent-uuid="$route.meta.parentUuid"
      :container-uuid="windowMetadata.currentTabUuid"
      :parent-panel="panelType"
      :modal-metadata="windowMetadata"
    />
    <el-row :gutter="20">
      <tab-parent
        :window-uuid="windowUuid"
        :tabs-list="windowMetadata.tabsListParent"
        class="tab-window"
      />
      <modal-dialog />
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
import SplitPanel from '@/components/ADempiere/Panel/detail'
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import ContextMenu from '@/components/ADempiere/ContextMenu'
import ModalDialog from '@/components/ADempiere/Dialog'
import { createEntity, updateEntity } from '@/api/ADempiere/data'

export default {
  name: 'Window',
  components: {
    TabParent,
    TabChildren,
    SplitPanel,
    ContextMenu,
    ModalDialog
  },
  data() {
    return {
      windowMetadata: {},
      windowUuid: this.$route.meta.uuid,
      panelType: 'window',
      isLoading: false,
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
  mounted() {
    this.createNew()
    this.updatedExist()
  },
  methods: {
    createEntity,
    updateEntity,
    createNew() {
      this.createEntity({
        tableId: 135, // test table,
        attributesList: [
          { colunmName: 'AD_Client_ID', value: 0 },
          { colunmName: 'AD_Org_ID', value: 0 },
          { colunmName: 'Name', value: 'test 1333' },
          { colunmName: 'Description', value: 'TEST 333' }
        ]
      }).then(response => {
        console.log('created', response)
      }).catch(error => {
        console.warn('created', error)
      })
    },
    updatedExist() {
      this.updateEntity({
        tableId: 135, // test table,
        recordId: 1000014,
        attributesList: [
          { colunmName: 'AD_Client_ID', value: 0 },
          { colunmName: 'AD_Org_ID', value: 0 },
          { colunmName: 'Name', value: 'test 1333' },
          { colunmName: 'Description', value: 'TEST 333' }
        ]
      }).then(response => {
        console.log('updated', response)
      }).catch(error => {
        console.warn('updated', error)
      })
    },
    getWindow() {
      var window = this.getterWindow
      if (window) {
        this.windowMetadata = window
        this.isLoading = true
      } else {
        this.$store.dispatch('getWindowFromServer', this.windowUuid)
          .then(response => {
            this.windowMetadata = response
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
</style>
