<template>
  <div v-if="isLoading">
    <context-menu
      class="sticky-submenu"
      :parent-uuid="containerUuid"
      :parent-panel="panelType"
      :report="processMetadata.isReport"
    />
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="content-collapse">
          <h3 v-show="!isEmptyValue(processMetadata.name)" class="warn-content text-center">
            {{ processMetadata.name }}
          </h3>
          <el-collapse v-if="!isEmptyValue(processMetadata.help)" v-model="activeNames">
            <el-collapse-item title="Help" name="2" aling="center">
              <div class="content-help" v-html="processMetadata.help" />
            </el-collapse-item>
          </el-collapse>
          <panel
            :position-tab="processMetadata.accesLevel"
            :container-uuid="processUuid"
            :metadata="processMetadata"
            :is-edit="isEdit"
            :panel-type="panelType"
          />
        </el-card>
        <!-- <code v-show="!isEmptyValue(processMetadata.help)" v-html="processMetadata.help" /> -->
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
import { isEmptyValue } from '@/utils/ADempiere/valueUtil'

export default {
  name: 'Process',
  components: {
    Panel,
    ContextMenu
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      processMetadata: {},
      processUuid: this.$route.meta.uuid,
      containerUuid: this.$route.meta.uuid,
      isLoading: false,
      recordUuid: this.$route.params.uuidRecord,
      activeNames: [],
      panelType: 'process'
    }
  },
  beforeMount() {
    this.getProcess(this.$route.meta.uuid)
    // this.subscribeAction()
  },
  methods: {
    isEmptyValue,
    getProcess(uuid = null) {
      if (!uuid) {
        uuid = this.$route.meta.uuid
      }
      var process = this.$store.getters.getProcess(uuid)
      if (typeof process === 'undefined') {
        this.$store.dispatch('getPanelAndFields', {
          containerUuid: uuid,
          type: this.panelType
        }).then(response => {
          this.processMetadata = response
          this.isLoading = true
        }).catch(err => {
          this.isLoading = true
          console.log('Dictionary Process - Error ' + err.code + ': ' + err.message)
        })
      } else {
        this.isLoading = true
        this.processMetadata = process
      }
    },
    subscribeAction() {
      this.$store.subscribeAction({
        after: (action, state) => {
          if (action.type === 'startProcess') {
            this.$notify.info({
              title: 'Info',
              message: 'Processing'
            })
          }
          if (action.type === 'finishProcess') {
            if (action.payload.isError) {
              this.$notify.error({
                title: 'Error',
                message: 'The process was not executed'
              })
            } else {
              this.$notify({
                title: 'Success',
                message: 'process executed, see process activity',
                type: 'success'
              })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped >
  .warn-content{
    margin: 0px 0px !important;
    padding-top: 39px !important;
  }
  .content-help{
    width: 100%;
    height: 200%;
    padding-left: 39px !important;
  }
  /* .el-collapse {
    border-top: 1px solid #e6ebf5;
    border-bottom: 1px solid #e6ebf5;
    position: relative;
    width: 100%;
    left: 14px;
  } */
  .el-card {
    width: 100% !important;
    height: 200% !important;
  }
  .sticky-submenu {
    position: absolute !important;
    right: 0;
    top: 0;
  }
   .content-collapse{
    padding-left: 20 px !important;
    padding-top: 50 px !important;
  }
</style>
