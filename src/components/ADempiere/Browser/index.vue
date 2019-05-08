<template>
  <div>
    <div v-if="loading">
      <sticky class="sticky-submenu">
        <submenu />
      </sticky>
      <el-row :gutter="20">
        <el-col :span="24">
          <h3 v-show="checkValue(browserMetadata.description)" class="warn-content text-center">
            <div>{{ browserMetadata.description }}  </div>
          </h3>
          <code v-show="checkValue(browserMetadata.help)" v-html="browserMetadata.help" />
          <panel
            :container-uuid="browserUuid"
            :metadata="browserMetadata"
            panel-type="browser"
          />
          <data-table />
        </el-col>
      </el-row>
    </div>
    <div v-else style="padding: 20px 100px">
      <h3>
        Loading SmatBrowser...
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
import DataTable from '@/components/ADempiere/DataTable'
import { checkStringValue } from '@/utils/ADempiere/valueUtil'

export default {
  name: 'Browser',
  components: {
    Panel,
    DataTable,
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
      browserMetadata: {},
      browserUuid: this.$route.meta.uuid,
      loading: false,
      uuidRecord: this.$route.params.uuidRecord
    }
  },
  created() {
    this.getBrowser(this.$route.meta.uuid)
  },
  beforeMount() {
    this.getBrowser(this.$route.meta.uuid)
  },
  methods: {
    checkValue(text) {
      return checkStringValue(text)
    },
    getBrowser(uuid = null) {
      if (!uuid) {
        uuid = this.$route.meta.uuid
      }
      var browser = this.$store.getters.getBrowser(uuid)
      if (typeof browser === 'undefined') {
        this.$store.dispatch('getBrowserFromServer', uuid)
          .then(response => {
            this.browserMetadata = response
            this.loading = true
          })
          .catch(err => {
            this.loading = true
            console.log('Dictionary browse - Error ' + err.code + ': ' + err.message)
          })
      } else {
        this.loading = true
        this.browserMetadata = browser
      }
    }
  }
}
</script>

<style scoped >
  .warn-content{
    margin: 10px 0px !important;
  }
</style>
