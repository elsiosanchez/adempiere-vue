<template>
  <el-dialog :title="metadata.name" :visible="visibleDialog" :show-close="false" :width="width+'%'">
    {{ metadata.description }}
    <panel
      :parent-uuid="parentUuid"
      :container-uuid="metadata.uuid"
      :metadata="metadata"
      :panel-type="'process'"
    />
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">Cancel</el-button>
      <el-button type="primary" @click="runAction(metadata)">Confirm</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Panel from '@/components/ADempiere/Panel'

export default {
  name: 'Modal',
  components: {
    Panel
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    parentUuid: {
      type: String,
      default: ''
    },
    metadata: {
      type: Object,
      required: true
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
    visibleDialog() {
      return this.$store.state.processControl.visibleDialog
    }
  },
  methods: {
    closeDialog() {
      this.$store.dispatch('setShowDialog', undefined)
    },
    runAction(action) {
      console.log(action)
      this.closeDialog()
      this.$notify.info({
        title: 'Info',
        message: 'Processing ' + action.name
      })
      this.$store.dispatch('startProcess', {
        action: action,
        containerUuid: action.processUuid
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
    }
  }
}
</script>
