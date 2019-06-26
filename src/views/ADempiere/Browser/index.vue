<template>
  <div v-if="isLoading">
    <context-menu
      class="sticky-submenu"
      :parent-uuid="containerUuid"
      :parent-panel="panelType"
    />
    <modal
      :visible="isVisisbleDialog"
      :metadata="processMetadata"
      :parent-uuid="containerUuid"
      @closeDialog="isVisisbleDialog=true"
    />
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="content-collapse">
          <h3 v-show="!isEmptyValue(browserMetadata.name)" class="warn-content text-center">
            <el-popover
              v-if="!isEmptyValue(browserMetadata.help)"
              placement="top-start"
              :title="browserMetadata.name"
              width="400"
              trigger="hover"
              :content="browserMetadata.help"
            >
              <i slot="reference" class="el-icon-info" />
            </el-popover>
            {{ browserMetadata.name }}
          </h3>
          <el-collapse v-model="activeNames" class="container-collasep-open">
            <el-collapse-item title="Search Criteria" name="1">
              <panel
                :container-uuid="containerUuid"
                :metadata="browserMetadata"
                :panel-type="panelType"
              />
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
      <el-col :span="24">
        <div v-if="this.$store.state.app.sidebar.opened">
          <div class="container-panel-open">
            <data-table
              :container-uuid="containerUuid"
              :panel-type="panelType"
            />
          </div>
        </div>
        <div v-else-if="!this.$store.state.app.sidebar.opened">
          <div class="container-panel">
            <data-table
              :container-uuid="containerUuid"
              :panel-type="panelType"
            />
          </div>
        </div>
      </el-col>
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
// When supporting the processes, smart browser and reports,
// the ContextMenu and sticky must be placed in the layout
import ContextMenu from '@/components/ADempiere/ContextMenu'
import Panel from '@/components/ADempiere/Panel'
import DataTable from '@/components/ADempiere/DataTable'
import { isEmptyValue } from '@/utils/ADempiere/valueUtil'
import Modal from '@/components/ADempiere/Dialog'
export default {
  name: 'Browser',
  components: {
    Panel,
    DataTable,
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
      browserMetadata: {},
      browserUuid: this.$route.meta.uuid,
      containerUuid: this.$route.meta.uuid,
      isLoading: false,
      activeNames: [],
      uuidRecord: this.$route.params.uuidRecord,
      isVisisbleDialog: this.$store.state.processControl.visibleDialog,
      processMetadata: {},
      panelType: 'browser'
    }
  },
  beforeCreate() {
    this.$store.subscribe(mutation => {
      if (mutation.type === 'setShowDialog') {
        if (typeof mutation.payload !== 'undefined') {
          this.isVisisbleDialog = true
          this.processMetadata = mutation.payload
        }
      }
    })
  },
  created() {
    this.getBrowser(this.$route.meta.uuid)
  },
  beforeMount() {
    this.getBrowser(this.$route.meta.uuid)
  },
  mounted() {
    this.reloadContextMenu()
  },
  methods: {
    isEmptyValue,
    reloadContextMenu() {
      this.$store.dispatch('reloadContextMenu', {
        containerUuid: this.containerUuid
      })
    },
    getBrowser(uuid = null) {
      if (!uuid) {
        uuid = this.$route.meta.uuid
      }
      var browser = this.$store.getters.getBrowser(uuid)
      if (typeof browser === 'undefined') {
        this.$store.dispatch('getBrowserFromServer', uuid)
          .then(response => {
            this.browserMetadata = response
            this.isLoading = true
          })
          .catch(err => {
            this.isLoading = true
            console.log('Dictionary browse - Error ' + err.code + ': ' + err.message)
          })
      } else {
        this.isLoading = true
        this.browserMetadata = browser
      }
    }
  }
}
</script>

<style scoped>
  .warn-content{
    margin: 10px 0px !important;
  }
  .content-help{
    width: 100%;
    height: 200%;
    padding-left: 15px !important;
  }
  .content-collapse{
      padding-left: 20 px !important;
  }
  .container-panel {
    bottom: 0;
    right: 0;
    z-index: 0;
    padding-right: 20px;
    padding-left: 20px;
    transition: width 0.28s;
    border: 1px solid #e5e9f2;
  }
  .container-panel-open {
    bottom: 0;
    right: 0;
    padding-right: 20px;
    padding-left: 20px;
    border: 1px solid #e5e9f2;
    height: -webkit-fill-available;
    height:-webkit-calc(100% - 100px);
    z-index: 0;
    transition: width 0.28s;
  }
  .container-collasep-open {
    bottom: 0;
    right: 0;
    z-index: 0;
    transition: width 0.28s;
  }
  .sticky-submenu {
    position: absolute !important;
    right: 10px;
    top: 0;
  }
  .el-collapse-item__header {
    height: 39px !important;
  }
</style>
