<template>
  <el-container v-if="isLoading" class="view-base" style="height: 86vh;">
    <modal-dialog
      :container-uuid="browserUuid"
      :panel-type="panelType"
    />
    <el-header>
      <context-menu
        :menu-parent-uuid="$route.meta.parentUuid"
        :container-uuid="browserUuid"
        :panel-type="panelType"
      />
      <div class="w-33">
        <div class="center">
          <el-button
            v-if="isEmptyValue(browserMetadata.help)"
            slot="reference"
            type="text"
            :class="cssClassTitle + ' warn-content text-center'"
          >
            {{ browserMetadata.name }}
          </el-button>
        </div>
      </div>
      <el-popover
        v-if="!isEmptyValue(browserMetadata.name)"
        placement="top-start"
        :title="browserMetadata.name"
        :class="cssClassHelp"
        trigger="hover"
      >
        <div v-html="browserMetadata.help" />
        <div class="w-33">
          <div class="center">
            <el-button
              v-if="isEmptyValue(browserMetadata.help)"
              slot="reference"
              type="text"
              :class="cssClassTitle + 'warn-content text-center'"
            >
              {{ browserMetadata.name }}
            </el-button>
          </div>
        </div>
      </el-popover>
    </el-header>
    <el-main>
      <el-collapse v-model="activeSearch" class="container-collasep-open" @change="handleChange">
        <el-collapse-item :title="$t('views.searchCriteria')" name="opened-criteria">
          <panel
            :container-uuid="browserUuid"
            :metadata="browserMetadata"
            :panel-type="panelType"
          />
        </el-collapse-item>
      </el-collapse>
      <data-table
        v-if="isLoading"
        :container-uuid="browserUuid"
        :panel-type="panelType"
        :metadata="browserMetadata"
      />
    </el-main>
  </el-container>
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
import ModalDialog from '@/components/ADempiere/Dialog'

export default {
  name: 'Browser',
  components: {
    Panel,
    DataTable,
    ContextMenu,
    ModalDialog
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
      activeSearch: [],
      isLoading: false,
      panelType: 'browser'
    }
  },
  computed: {
    getterBrowser() {
      return this.$store.getters.getBrowser(this.browserUuid)
    },
    getDataRecords() {
      return this.$store.getters.getDataRecordsList(this.browserUuid)
    },
    getContainerIsReadyForSubmit() {
      return this.$store.getters.isReadyForSubmit(this.browserUuid)
    },
    cssClass() {
      if (this.$store.state.app.sidebar.opened) {
        return 'container-panel-open'
      }
      return 'container-panel'
    },
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
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
    }
  },
  watch: {
    isLoading(value) {
      if (value) {
        this.browserMetadata = this.getterBrowser
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
    this.getBrowser()
  },
  methods: {
    isEmptyValue,
    handleChange(value) {
      var showCriteria = false
      if (this.activeSearch.length > 0) {
        showCriteria = true
      }
      this.$store.dispatch('changeShowedCriteriaBrowser', {
        panelType: this.panelType,
        containerUuid: this.browserUuid,
        isShowedCriteria: showCriteria
      })
    },
    getBrowser() {
      if (this.getterBrowser) {
        this.isLoading = true
      } else {
        this.$store.dispatch('getPanelAndFields', {
          containerUuid: this.browserUuid,
          type: this.panelType
        })
          .then(response => {
            this.isLoading = true
          })
          .catch(error => {
            console.log('Dictionary browse - Error ' + error.code + ': ' + error.message)
          })
      }
    },
    defaultSearch() {
      if (this.getDataRecords.length <= 0 && this.getContainerIsReadyForSubmit) {
        this.$store.dispatch('getBrowserSearch', {
          containerUuid: this.browserUuid
        })
          .catch(error => {
            console.war(error)
          })
      }
    }
  }
}
</script>

<style>
  .el-collapse-item__header:hover {
    background-color: #fcfcfc;
  }
</style>
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
    color: #000000;
    text-size-adjust: 20px;
    font-size: 100%;
    font-weight: 605!important;
    /* left: 50%; */
  }
  .title-mobile {
    text-align: center;
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
    width: 100%;
    background-color: transparent;
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
