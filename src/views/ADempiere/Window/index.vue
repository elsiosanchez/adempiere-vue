<template>
  <div v-if="isLoading">
    <el-row :gutter="20">
      <tab
        :window-uuid="windowUuid"
        :tabs-list="windowMetadata.tabsListParent"
        :is-edit="isEdit"
      />
      <submenu class="sticky-submenu" />
      <modal
        :visible="isVisibleDialog"
        :metadata="processMetadata"
        :parent-uuid="windowUuid"
        @closeDialog="isVisibleDialog=false"
      />
      <detail :show-detail="typeof windowMetadata.tabsListChildren != 'undefined' && windowMetadata.tabsListChildren.length > 0">
        <tab-children
          :window-uuid="windowUuid"
          :tabs-list="windowMetadata.tabsListChildren"
        />
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
import TabChildren from '@/components/ADempiere/Tab/tabChildren'
import Detail from '@/components/ADempiere/Panel/detail'
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import Submenu from '@/components/ADempiere/ContextMenu'
import Modal from '@/components/ADempiere/Dialog'

export default {
  name: 'Window',
  components: {
    Tab,
    TabChildren,
    Detail,
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
    width: calc(100% - 209px);
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
