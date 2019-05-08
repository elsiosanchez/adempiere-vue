<template>
  <div v-if="device==='mobile'" class="container-submenu">
    <el-menu :default-active="activeIndex" :router="false" class="el-menu-demo" mode="horizontal" menu-trigger="click">
      <el-submenu class="el-menu-item" index="1">
        <template slot="title"><svg-icon icon-class="list" /></template>
        <el-submenu :disabled="isDisabled" index="1-1">
          <template slot="title">Processes</template>
          <el-menu-item v-for="(action, index) in actions" :key="index" :index="action.name" @click="runAction(action)">
            {{ process.name }}
          </el-menu-item>
        </el-submenu>
        <el-submenu index="1-2">
          <template slot="title">Actions</template>
          <el-menu-item index="1-2-1">
            <router-link :to="openNew" append>
              New
            </router-link>
          </el-menu-item>
        </el-submenu>
      </el-submenu>
    </el-menu>
  </div>
  <div v-else class="container-submenu">
    <el-menu :router="false" class="el-menu-demo" mode="horizontal" menu-trigger="click">
      <el-menu-item index="1">Menu</el-menu-item>
      <el-submenu class="el-menu-item" index="2">
        <template slot="title">Actions</template>
        <el-menu-item v-for="(action, index) in actions" :key="index" :index="action.name" @click="runAction(action)">
          {{ action.name }}
        </el-menu-item>
      </el-submenu>
      <el-menu-item index="3">References</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import ResizeMixin from '@/layout/mixin/ResizeHandler'

export default {
  name: 'Submenu',
  mixins: [ResizeMixin],
  props: {
    report: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeIndex: '1',
      relations: [],
      actions: this.$store.getters.getActions(this.$route.meta.uuid),
      references: []
    }
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
    isDisabled() {
      if (this.processesList.length > 0) {
        return false
      }
      return true
    },
    isReport() {
      if (this.report === true) {
        return true
      }
      return false
    }
  },
  created() {
    this.subscribeChanges()
  },
  methods: {
    showModal(action) {
      var processData = this.$store.getters.getProcess(action.uuid)
      if (typeof processData === 'undefined') {
        this.$store.dispatch('getProcessFromServer', action.uuid)
          .then(response => {
            this.$emit('showModal', response)
          }).catch(err => {
            console.warn('ContextMenu: Dictionary Process (State ) - Error ' + err.code + ': ' + err.message)
          })
      } else {
        this.$emit('showModal', processData)
      }
    },
    subscribeChanges() {
      this.$store.subscribe(mutation => {
        if (mutation.type === 'reloadContextMenu') {
          this.processesList = mutation.payload
          this.actions = this.$store.getters.getActions(mutation.payload.containerUuid)
        }
      })
    },
    runAction(action) {
      if (action.type === 'action') {
        this.$message({
          message: 'Processing',
          type: 'info',
          showClose: true
        })
        this.$store.dispatch('addProcessExecution', this.$route.meta.uuid)
        this.$store.dispatch(action.action, {
          action: action,
          route: this.$route.meta,
          type: this.$route.meta.type
        })
      } else if (action.type === 'process') {
        this.showModal(action)
      }
    }
  }
}
</script>

<style>
  .container-submenu{
    position: relative;
    z-index: 1;
    height: 39px !important;
    float: right;
  }

  ul.el-menu-demo > .el-menu-item {
    height: 39px !important;
    line-height: 39px !important;
    padding: 0 10px;
  }

  .el-menu-demo > .el-menu-item > .el-submenu__title{
    line-height: 39px;
    height: 39px !important;
    padding: 0;
  }

  .el-menu--horizontal .el-submenu > .el-menu--horizontal {
    left: initial !important;
    right: 150px;
  }

  .el-menu--popup-bottom-start{
    min-width: 150px !important;
  }

  .el-menu--popup-right-start{
    min-width: 150px !important;
  }

  .el-menu--popup-right-start > .el-menu-item{
    min-width: 150px;
  }
</style>
