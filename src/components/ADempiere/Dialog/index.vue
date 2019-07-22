<template>
  <el-dialog
    :title="modalMetadata.name"
    :visible="isVisibleDialog"
    :show-close="false"
    :width="width+'%'"
    top="5vh"
    :close-on-press-escape="true"
    :close-on-click-modal="true"
  >
    {{ modalMetadata.description }}
    <panel
      v-if="modalMetadata.panelType !== 'search' && modalMetadata.uuid !== ''"
      :parent-uuid="parentUuid"
      :container-uuid="modalMetadata.uuid"
      :metadata="modalMetadata"
      :is-view="false"
      :panel-type="'process'"
    />
    <!-- <search-window
      v-else
      :tab-uuid="modalMetadata.currentTab.uuid"
      :window-uuid="modalMetadata.currentTab.windowUuid"
      :table-name="modalMetadata.currentTab.tableName"
    /> -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">
        {{ $t('components.dialogCancelButton') }}
      </el-button>
      <el-button type="primary" @click="runAction(modalMetadata)">
        {{ $t('components.dialogConfirmButton') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import Panel from '@/components/ADempiere/Panel'
import { isEmptyValue } from '@/utils/ADempiere/valueUtil.js'
import { showNotification } from '@/utils/ADempiere/notification.js'
// import SearchWindow from '@/views/ADempiere/SearchWindow'

export default {
  name: 'ModalProcess',
  components: {
    // SearchWindow,
    Panel
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    parentUuid: {
      type: String,
      default: ''
    },
    metadata: {
      type: Object,
      default: () => {}
    },
    parentPanel: {
      type: String,
      default: undefined
    },
    reportExportType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      processMetadata: {},
      titleDialog: ''
    }
  },
  computed: {
    width() {
      if (this.$store.state.app.device === 'mobile') {
        return 80
      }
      return 50
    },
    isVisibleDialog() {
      return this.$store.state.processControl.visibleDialog
    },
    modalMetadata() {
      return this.$store.state.processControl.metadata
    },
    windowRecordSelected() {
      return this.$store.state.window.recordSelected
    }
  },
  methods: {
    isEmptyValue,
    showNotification,
    closeDialog() {
      this.$store.dispatch('setShowDialog', {
        type: this.modalMetadata.panelType,
        action: undefined
      })
    },
    runAction(action) {
      if (action === undefined && this.windowRecordSelected !== undefined) {
        this.$router.push({ name: this.$route.name, params: { uuidRecord: this.windowRecordSelected.UUID }})
        this.closeDialog()
      } else if (typeof action !== 'undefined') {
        var finalParameters = this.$store.getters.getParamsProcessToServer(action.uuid)
        if ((finalParameters.fieldsMandatory.length > 0 && finalParameters.params.length >= finalParameters.fieldsMandatory.length) || finalParameters.fieldsMandatory.length === 0) {
          this.closeDialog()
          this.$store.dispatch('startProcess', {
            action: action,
            reportFormat: this.reportExportType,
            containerUuid: action.uuid,
            parentUuid: this.parentUuid,
            parentPanel: this.parentPanel
          })
          if (action.isReport) {
            this.$store.subscribeAction({
              after: (action, state) => {
                if (action.type === 'finishProcess') {
                  this.$router.push({
                    name: 'Report Viewer',
                    params: {
                      processUuid: action.payload.processUuid,
                      instanceUuid: action.payload.instanceUuid,
                      fileName: action.payload.output.fileName
                    }
                  })
                  this.$store.dispatch('tagsView/delView', this.$route)
                }
              }
            })
          }
          this.$store.dispatch('tagsView/delView', this.$route)
            .then(({ visitedViews }) => {
              this.$router.push('/')
            })
        } else {
          var emptyField = finalParameters.fieldsMandatory.find(filed => {
            if (this.isEmptyValue(filed.value)) {
              return true
            }
          })
          this.showNotification({
            type: 'warning',
            title: this.$t('notifications.emptyValues'),
            name: '<b>' + emptyField.name + '.</b> ',
            message: this.$t('notifications.fieldMandatory')
          })
        }
      }
    }
  }
}
</script>
