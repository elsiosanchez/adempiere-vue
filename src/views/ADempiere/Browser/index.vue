<template>
  <div v-if="isLoading">
    <context-menu
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
        <div class="containert">
          <el-popover
            v-if="!isEmptyValue(browserMetadata.name)"
            placement="top-start"
            :title="browserMetadata.name"
            width="400"
            trigger="hover"
          >
            <div v-html="browserMetadata.help" />
            <el-button v-if="!isEmptyValue(browserMetadata.help)" slot="reference" type="text" class="title">{{ browserMetadata.name }}</el-button>
          </el-popover>
          <el-button v-if="isEmptyValue(browserMetadata.help)" slot="reference" type="text" class="title">{{ browserMetadata.name }}</el-button>
          <div>
            <br>
            <el-button v-show="!openContainer" icon="el-icon-search" type="text" class="opem" @click="openContainer = !openContainer"> {{ $t('views.searchCriteria') }} </el-button>
            <el-button v-show="openContainer" icon="el-icon-close" type="text" class="close" @click="openContainer = !openContainer" />
            <div>
              <el-collapse-transition>
                <div v-show="openContainer">
                  <div class="transition-box">
                    <panel
                      :container-uuid="containerUuid"
                      :metadata="browserMetadata"
                      :panel-type="panelType"
                    />
                  </div>
                </div>
              </el-collapse-transition>
            </div>
          </div>
        </div>
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
      activeSearch: [],
      uuidRecord: this.$route.params.uuidRecord,
      isVisisbleDialog: this.$store.state.processControl.visibleDialog,
      processMetadata: {},
      panelType: 'browser'
    }
  },
  computed: {
    getParamsProcessToServer() {
      return this.$store.getters.getParamsProcessToServer(this.$route.meta.uuid)
    },
    getDataDetail() {
      return this.$store.getters.getDataRecordDetail(this.containerUuid)
    }
  },
  watch: {
    isLoading(value) {
      if (value) {
        this.defaultSearch()
      }
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
    },
    defaultSearch() {
      this.activeSearch = ['1']
      if (this.getDataDetail.length <= 0) {
        var finalParameters = this.getParamsProcessToServer
        if ((finalParameters.fieldsMandatory.length > 0 &&
          finalParameters.params.length >= finalParameters.fieldsMandatory.length) ||
          finalParameters.fieldsMandatory.length === 0) {
          this.$store.dispatch('getBrowserSearch', {
            containerUuid: this.browserUuid
          })
        }
      }
    }
  }
}
</script>

<style scoped>
  .containert {
    padding-left: 20px;
    padding-right: 20px;
    width: 100%;
  }
  .title{
    color: #000000;
    text-size-adjust: 20px;
    font-size: 100%;
    font-weight: 605!important;
  }
  .close{
    color: #000000;
    text-size-adjust: 20px;
    font-size: 100%;
    font-weight: 605!important;
    position: relative;
    left: 96%;
  }
  .opem{
    color: #000000;
    text-size-adjust: 20px;
    font-size: 100%;
    font-weight: 605!important;
  }
  .warn-content {
    margin: 10px 0px !important;
  }
  .content-help {
    width: 100%;
    height: 200%;
    padding-left: 15px !important;
  }
  .content-collapse {
    padding-left: 20 px !important;
  }
  .container-panel {
    bottom: 0;
    right: 0;
    z-index: 0;
    /* padding-right: 20px;
    padding-left: 20px; */
    transition: width 0.28s;
    border: 1px solid #e5e9f2;
  }
  .container-panel-open {
    bottom: 0;
    right: 0;
    /* padding-right: 20px;
    padding-left: 20px; */
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
  .el-collapse-item__header {
    height: 39px !important;
  }
</style>
