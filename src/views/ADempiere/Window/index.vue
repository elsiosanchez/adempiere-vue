<template>
  <div v-if="loading">
    <el-row :gutter="20">
      <tab
        :window-uuid="windowUuid"
        :tabs-list="windowMetadata.tabsListParent"
        :parent-tabs="true"
        :is-edit="isEdit"
      />
      <submenu class="sticky-submenu" />
      <modal
        :visible="visibleDialog"
        :metadata="processMetadata"
        :parent-uuid="windowUuid"
        @closeDialog="visibleDialog=false"
      />
      <detail :show-detail="typeof windowMetadata.tabsListChildren != 'undefined' && windowMetadata.tabsListChildren.length > 0">
        <el-tabs type="border-card" class="transi-box2">
          <template v-for="(item, key) in windowMetadata.tabsListChildren">
            <el-tab-pane
              :key="key"
              :label="item.name"
              :lazy="true"
              class="el-tabs__nav-scroll"
            >
              <data-table
                :parent-uuid="windowMetadata.uuid"
                :container-uuid="item.uuid"
                :metadata="item"
                :position-tab="key"
                :table-name="item.tableName"
                :group="item.tabGroup"
                :parent="false"
                :searchable="false"
              />
            </el-tab-pane>
          </template>
        </el-tabs>
      </detail>
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
import Detail from '@/components/ADempiere/Panel/detail'
import DataTable from '@/components/ADempiere/DataTable'
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import Submenu from '@/components/ADempiere/ContextMenu'
import Modal from '@/components/ADempiere/Dialog'

export default {
  name: 'Window',
  components: {
    Tab,
    Detail,
    Submenu,
    DataTable,
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
      loading: false,
      showPanel: true,
      uuidRecord: this.$route.params.uuidRecord,
      show3: true,
      visibleDialog: this.$store.state.processControl.visibleDialog,
      processMetadata: {},
      isMobile: true
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
    if (this.$store.state.app.device === 'mobile') {
      this.isMobile = !this.isMobile
    }
    this.$store.subscribe(mutation => {
      if (mutation.type === 'setShowDialog') {
        if (typeof mutation.payload !== 'undefined') {
          this.visibleDialog = true
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
            this.loading = true
          })
          .catch(err => {
            this.loading = true
            console.warn('Dictionary Window - Error ' + err.code + ': ' + err.message)
          })
      } else {
        this.loading = true
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

  .transi-box {
    bottom: 0;
    width: calc(100% - 170px);
    position: fixed;
    border-radius: 4px;
    background-color: #FFF;
    text-align: center;
    color: #FFF;
    box-sizing: border-box;
    height: 39%;
  }

  .transi-box2 {
    margin-bottom: 0px;
    width: calc(100% + 10px);
    position: fixed;
    bottom: 0;
    border-radius: 4px;
    background-color: #FFF;
    text-align: center;
    color: #FFF;
    height: 39%;

    box-sizing: border-box;
    margin-right: 2px;
  }

  .el-row {
    margin-bottom: 20px;
  }

  .el-col {
    border-radius: 4px;
    left: 150px;
  }

  .sticky-submenu {
    position: absolute !important;
    right: 10px;
    top: 0;
  }
</style>
