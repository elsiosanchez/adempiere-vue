<template>
  <div v-if="isLoading" class="view-base">
    <context-menu
      :menu-parent-uuid="$route.meta.parentUuid"
      :container-uuid="containerUuid"
      :parent-panel="panelType"
    />
    <modal
      :visible="isVisisbleDialog"
      :parent-uuid="containerUuid"
      @closeDialog="isVisisbleDialog=true"
    />
    <el-main>
      <div class="containert">
        <div class="menu" />
        <el-button v-if="isEmptyValue(browserMetadata.help)" slot="reference" type="text" :class="cssClassTitle()" class="warn-content text-center">{{ browserMetadata.name }}</el-button>
      </div>
      <el-collapse v-model="activeSearch" class="container-collasep-open" @change="handleChange">
        <el-popover
          v-if="!isEmptyValue(browserMetadata.name)"
          placement="top-start"
          :title="browserMetadata.name"
          class="cssClassHelp"
          trigger="hover"
        >
          <div v-html="browserMetadata.help" />
          <el-button v-if="!isEmptyValue(browserMetadata.help)" slot="reference" type="text" :class="cssClassTitle()" class="warn-content text-center">
            {{ browserMetadata.name }}
          </el-button>
        </el-popover>
        <el-collapse-item name="opened-criteria">
          <panel
            :container-uuid="containerUuid"
            :metadata="browserMetadata"
            :panel-type="panelType"
          />
        </el-collapse-item>
      </el-collapse>
      <data-table
        v-if="isLoading"
        :container-uuid="containerUuid"
        :panel-type="panelType"
        :metadata="browserMetadata"
      />
    </el-main>
  </div>
  <div
    v-else
    v-loading="!isLoading"
    :element-loading-text="$t('notifications.loading')"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
    class="loading-browser"
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
      activeSearch: [],
      isLoading: false,
      uuidRecord: this.$route.params.uuidRecord,
      isVisisbleDialog: this.$store.state.processControl.visibleDialog,
      processMetadata: {},
      panelType: 'browser'
    }
  },
  computed: {
    getDataDetail() {
      return this.$store.getters.getDataRecordDetail(this.containerUuid)
    },
    getContainerIsReadyForSubmit() {
      return this.$store.getters.isReadyForSubmit(this.containerUuid)
    },
    cssClass() {
      if (this.$store.state.app.sidebar.opened) {
        return 'container-panel-open'
      }
      return 'container-panel'
    },
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    }
  },
  watch: {
    isLoading(value) {
      if (value) {
        this.defaultSearch()
      }
    },
    'browserMetadata.isShowedCriteria'(value) {
      if (value) {
        this.activeSearch = ['opened-criteria']
      }
    }
  },
  created() {
    this.getBrowser(this.$route.meta.uuid)
  },
  methods: {
    isEmptyValue,
    cssClassTitle() {
      if (this.isMobile) {
        return 'title-mobile'
      }
      return 'title'
    },
    cssClassHelp() {
      if (this.isMobile) {
        return 'content-help-mobile'
      }
      return 'content-help'
    },
    handleChange(value) {
      var showCriteria = false
      if (this.activeSearch.length > 0) {
        showCriteria = true
      }
      this.$store.dispatch('changeShowedCriteriaBrowser', {
        panelType: this.panelType,
        containerUuid: this.containerUuid,
        isShowedCriteria: showCriteria
      })
    },
    getBrowser(uuid = null) {
      if (!uuid) {
        uuid = this.$route.meta.uuid
      }
      var browser = this.$store.getters.getBrowser(uuid)
      if (browser === undefined) {
        this.$store.dispatch('getBrowserFromServer', uuid)
          .then(response => {
            this.browserMetadata = response
            this.isLoading = true
          })
          .catch(error => {
            this.isLoading = true
            console.log('Dictionary browse - Error ' + error.code + ': ' + error.message)
          })
      } else {
        this.isLoading = true
        this.browserMetadata = browser
      }
    },
    defaultSearch() {
      if (this.getDataDetail.length <= 0 && this.getContainerIsReadyForSubmit) {
        this.$store.dispatch('getBrowserSearch', {
          containerUuid: this.browserUuid
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

  .loading-browser {
    padding: 100px 100px;
    height: 100%;
  }

  .el-main {
    display: block;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    -ms-flex-preferred-size: auto;
    flex-basis: auto;
    overflow: auto;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding-bottom: 0px;
    padding-right: 20px;
    padding-top: 0px;
    padding-left: 20px;
  }
  .el-header {
    height: 50px;
  }
  .containert {
    padding-left: 20px;
    padding-right: 20px;
    width: 50%;
  }
  .menu {
    height: 40px;
  }
  .title {
    position: fixed;
    left: 40%;
    top: 128px;
    color: #000000;
    text-size-adjust: 20px;
    font-size: 100%;
    font-weight: 605!important;
    /* left: 50%; */
  }
  .title-mobile {
    position: fixed;
    top: 128px;
    color: #000000;
    text-size-adjust: 20px;
    font-size: 100%;
    font-weight: 605!important;
    /* left: 50%; */
  }
  .content-help {
    width: 100%;
    height: 200%;
    padding-left: 15px !important;
  }
  .content-help-mobile {
    width: 50%;
    height: 50%;
    padding-left: 15px !important;
  }
  .center{
    text-align: center;
  }
  .w-33 {
    width: 33.33%;
    background-color: orange;
  }
  .container-panel {
    bottom: 0;
    right: 0;
    z-index: 0;
    transition: width 0.28s;
    border: 1px solid #e5e9f2;
  }
  .container-panel-open {
    bottom: 0;
    right: 0;
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
</style>
