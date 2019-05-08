<template>
  <div>
    <div v-if="loading">
      <sticky class="sticky-submenu">
        <submenu :report="processMetadata.isReport" />
      </sticky>
      <el-row :gutter="20">
        <el-col :span="24">
          <h3 v-show="checkValue(processMetadata.name)" class="warn-content text-center">
            {{ processMetadata.name }}
          </h3>
          <code v-show="checkValue(processMetadata.help)" v-html="processMetadata.help" />
          <panel
            :position-tab="processMetadata.accesLevel"
            :container-uuid="processUuid"
            :metadata="processMetadata"
            :is-edit="isEdit"
            panel-type="process"
          />
        </el-col>
      </el-row>
    </div>
    <div v-else style="padding: 20px 100px">
      <h3>
        Loading Process...
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
import { checkStringValue } from '@/utils/ADempiere/valueUtil'

export default {
  name: 'Process',
  components: {
    Panel,
    Submenu,
    Sticky
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
      loading: false,
      recordUuid: this.$route.params.uuidRecord
    }
  },
  beforeMount() {
    this.getProcess(this.$route.meta.uuid)
  },
  methods: {
    reloadContextMenu() {
      this.$store.dispatch('reloadContextMenu', {
        containerUuid: this.$route.meta.uuid
      })
    },
    checkValue(text) {
      return checkStringValue(text)
    },
    getProcess(uuid = null) {
      if (!uuid) {
        uuid = this.$route.meta.uuid
      }
      var process = this.$store.getters.getProcess(uuid)
      if (typeof process === 'undefined') {
        this.$store.dispatch('getPanelAndFields', {
          parentUuid: uuid,
          containerUuid: uuid,
          type: 'process'
        }).then(response => {
          this.processMetadata = response
          this.loading = true
        }).catch(err => {
          this.loading = true
          console.log('Dictionary Process - Error ' + err.code + ': ' + err.message)
        })
        // this.$store.dispatch('getProcessFromServer', uuid)
        //   .then(response => {
        //     this.processMetadata = response
        //     this.loading = true
        //     // this.reloadContextMenu()
        //   })
        //   .catch(err => {
        //
        //   })
      } else {
        this.loading = true
        this.processMetadata = process
        // this.reloadContextMenu()
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
