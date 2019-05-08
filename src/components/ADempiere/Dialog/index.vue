<template>
  <el-dialog :title="metadata.name" :visible.sync="visible" :show-close="false" :width="width+'%'">
    {{ metadata.description }}
    <panel
      :parent-uuid="parentUuid"
      :container-uuid="metadata.uuid"
      :metadata="metadata"
      :panel-type="'process'"
    />
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">Cancel</el-button>
      <el-button type="primary" @click="closeDialog">Confirm</el-button>
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
      visibleDialog: false,
      titleDialog: ''
    }
  },
  computed: {
    width() {
      if (this.$store.state.app.device === 'mobile') {
        return 80
      }
      return 50
    }
  },
  methods: {
    closeDialog() {
      this.$emit('closeDialog')
    }
  }
}
</script>
