<template>
  <div v-if="isLoading">
    <sticky class="sticky-submenu">
      <context-menu />
    </sticky>
    <el-row :gutter="20">
      <el-col :span="24">
        <h2 v-show="checkValue(processMetadata.description)" class="warn-content text-center">
          <div>{{ processMetadata.description }}  </div>
        </h2>
        <code v-show="checkValue(processMetadata.help)" v-html="processMetadata.help" />
        <panel
          :position-tab="processMetadata.accesLevel"
          :container-uuid="metadataProcessUuid"
          :metadata-tab="processMetadata"
          :is-edit="isEdit"
          panel-type="report"
        />
      </el-col>
    </el-row>
  </div>
  <div v-else style="padding: 20px 100px">
    <h3>
      Loading Report...
    </h3>
  </div>
</template>

<script>
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import ContextMenu from '@/components/ADempiere/ContextMenu'
import Sticky from '@/components/Sticky'
import Panel from '@/components/ADempiere/Panel'

export default {
  name: 'Report',
  components: {
    Panel,
    ContextMenu,
    Sticky
  },
  props: {
    metadataProcessUuid: {
      type: String,
      default: ''
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      processMetadata: {},
      processUUID: this.$route.meta.uuid,
      isLoading: false,
      uuidRecord: this.$route.params.uuidRecord
    }
  },
  beforeMount() {
    this.getProcess(this.$route.meta.uuid)
  },
  methods: {
    getProcess(uuid = null) {
      if (!uuid) {
        uuid = this.$route.meta.uuid
      }

      var process = this.$store.getters.getProcess(uuid)
      if (typeof process === 'undefined') {
        this.$store.dispatch('getProcessAPI', uuid)
          .then(response => {
            this.processMetadata = response
            this.isLoading = true
          })
          .catch(err => {
            this.isLoading = true
            console.log('Dictionary Process - Error ' + err.code + ': ' + err.message)
          })
      } else {
        this.isLoading = true
        this.processMetadata = process
      }
    },
    checkValue(text) {
      if (text !== '') {
        return true
      }
    },
    htmlDecode(text) {
      var processMetadata = document.createElement('div')
      processMetadata.innerHTML = text
      return processMetadata.childNodes[0].nodeValue
    }
  }
}
</script>

<style scoped >
  .warn-content{
    margin: 10px 0px !important;
  }
</style>
