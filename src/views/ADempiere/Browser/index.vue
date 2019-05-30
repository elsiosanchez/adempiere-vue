<template>
  <div v-if="loading">
    <context-menu class="sticky-submenu" />
    <modal
      :visible="visibleDialog"
      :metadata="processMetadata"
      :parent-uuid="browserUuid"
      @closeDialog="visibleDialog=true"
    />
    <el-row :gutter="20">
      <el-col :span="24">
        <h3 v-show="!isEmptyValue(browserMetadata.description)" class="warn-content text-center">
          <div>{{ browserMetadata.description }}</div>
        </h3>
        <code v-show="!isEmptyValue(browserMetadata.help)" v-html="browserMetadata.help" />
        <panel
          :container-uuid="browserUuid"
          :metadata="browserMetadata"
          :panel-type="panelType"
        />
        <detail
          :show-detail="true"
        >
          <data-table
            :container-uuid="browserUuid"
            :panel-type="panelType"
            :data-record="recordParams"
          />
        </detail>
      </el-col>
    </el-row>
  </div>
  <div v-else style="padding: 20px 100px">
    <h3>
      Loading SmatBrowser...
    </h3>
  </div>
</template>

<script>
// When supporting the processes, smart browser and reports,
// the ContextMenu and sticky must be placed in the layout
import ContextMenu from '@/components/ADempiere/ContextMenu'
import Panel from '@/components/ADempiere/Panel'
import Detail from '@/components/ADempiere/Panel/detail'
import DataTable from '@/components/ADempiere/DataTable'
import { isEmptyValue } from '@/utils/ADempiere/valueUtil'
import Modal from '@/components/ADempiere/Dialog'

export default {
  name: 'Browser',
  components: {
    Panel,
    Detail,
    DataTable,
    ContextMenu,
    Modal
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
      showPanel: true,
      ocultar: true,
      browserUuid: this.$route.meta.uuid,
      loading: false,
      uuidRecord: this.$route.params.uuidRecord,
      visibleDialog: this.$store.state.processControl.visibleDialog,
      processMetadata: {},
      panelType: 'browser',
      recordParams: []
    }
  },
  beforeCreate() {
    this.$store.subscribe(mutation => {
      if (mutation.type === 'setShowDialog') {
        if (typeof mutation.payload !== 'undefined') {
          this.visibleDialog = true
          this.processMetadata = mutation.payload
        }
      }
    })
  },
  created() {
    this.getBrowser(this.$route.meta.uuid)
    this.subscribe()
  },
  beforeMount() {
    this.getBrowser(this.$route.meta.uuid)
  },
  mounted() {
    this.reloadContextMenu()
  },
  methods: {
    isEmptyValue,
    subscribe() {
      var recordParams = this.$store.getters.getRecordSelection(this.browserUuid)
      this.recordParams = recordParams.record
      this.$store.subscribe(mutation => {
        if (mutation.type === 'recordSelection' && mutation.payload.uuid === this.browserUuid) {
          console.log(mutation)
          this.recordParams = mutation.payload.record
        }
      })
    },
    reloadContextMenu() {
      this.$store.dispatch('reloadContextMenu', {
        containerUuid: this.browserUuid
      })
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

<style scoped>
  .warn-content{
    margin: 10px 0px !important;
  }

  .sticky-submenu {
    position: absolute !important;
    right: 10px;
    top: 0;
  }
</style>
