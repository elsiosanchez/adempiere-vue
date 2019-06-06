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
        <h3 v-show="!isEmptyValue(processMetadata.name)" class="warn-content text-center">
          {{ processMetadata.name }}
        </h3>
        <code v-show="!isEmptyValue(processMetadata.help)" v-html="processMetadata.help" />
        <panel
          :position-tab="processMetadata.accesLevel"
          :container-uuid="processUuid"
          :metadata="processMetadata"
          :is-edit="isEdit"
          :panel-type="panelType"
        />
      </el-col>
    </el-row>
  </div>
  <div v-else style="padding: 20px 100px">
    <h3>
      Loading Process...
    </h3>
  </div>
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
      panelType: 'process'
    }
  },
  beforeMount() {
    this.getProcess(this.$route.meta.uuid)
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
    }
  }
}
</script>

<style scoped >
  .warn-content{
    margin: 0px 0px !important;
    padding-top: 39px !important;
  }
  .sticky-submenu {
    position: absolute !important;
    right: 0;
    top: 0;
  }
</style>
