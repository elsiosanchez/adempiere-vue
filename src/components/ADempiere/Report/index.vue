<template>
  <div>
    <div v-if="loading">
      <sticky class="sticky-submenu">
        <submenu />
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
  </div>
</template>

<script>
// When supporting the processes, smart browser and reports,
// the submenu and sticky must be placed in the layout
import Submenu from '@/components/ADempiere/ContextMenu'
import Sticky from '@/components/Sticky'
import Panel from '@/components/ADempiere/Panel'

export default {
  name: 'Report',
  components: {
    Panel,
    Submenu,
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
      loading: false,
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
            this.loading = true
          })
          .catch(err => {
            this.loading = true
            console.log('Dictionary Process - Error ' + err.code + ': ' + err.message)
          })
      } else {
        this.loading = true
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
