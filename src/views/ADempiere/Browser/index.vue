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
        <h3 v-show="!isEmptyValue(browserMetadata.description)" class="warn-content text-center">
          <div>{{ browserMetadata.description }}</div>
        </h3>
        <code v-show="!isEmptyValue(browserMetadata.help)" v-html="browserMetadata.help" />
        <el-collapse v-model="activeNames">
          <el-collapse-item :title="browserMetadata.name" name="1">
            <panel
              :container-uuid="containerUuid"
              :metadata="browserMetadata"
              :panel-type="panelType"
            />
          </el-collapse-item>
        </el-collapse>
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
  <div v-else style="padding: 20px 100px">
    <h3>
      Loading SmatBrowser...
    </h3>
  </div>
</template>

<script>
// When supporting the processes, smart browser and reports,
// the ContextMenu and sticky must be placed in the layout
import ContextMenu from '@/components/ADempiere/ContextMenu'
import Panel from '@/components/ADempiere/Panel'
// import Detail from '@/components/ADempiere/Panel/detail'
import DataTable from '@/components/ADempiere/DataTable'
import { isEmptyValue } from '@/utils/ADempiere/valueUtil'
import Modal from '@/components/ADempiere/Dialog'
export default {
  name: 'Browser',
  components: {
    Panel,
    // Detail,
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
  .container-panel {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 0;
    width: calc(100% - 54px);
    transition: width 0.28s;
    border: 1px solid #99a9bf;
    background: #e5e9f2;
  }
  .container-panel-open {
    /* position: fixed; */
    bottom: 0;
    right: 0;
    border: 1px solid #99a9bf;
    background: #e5e9f2;
    z-index: 0;
    /* width: calc(100% - 210px); */
    transition: width 0.28s;
  }
  .sticky-submenu {
    position: absolute !important;
    right: 10px;
    top: 0;
  }
</style>
