<template>
  <div v-if="device==='mobile'" class="container-submenu-mobile">
    <el-menu :default-active="activeMenu" :router="false" class="el-menu-demo" mode="horizontal" menu-trigger="click">
      <el-submenu class="el-menu-item" index="1">
        <template slot="title"><i class="el-icon-more" /></template>
        <el-submenu v-if="relations.length > 0" class="el-menu-item" index="1-1">
          <template slot="title">Relations</template>
          <el-scrollbar wrap-class="scroll">
            <el-menu-item v-for="(relation, index) in relations" :key="index" :index="relation.meta.uuid" @click="handleClick(relation)">
              {{ relation.meta.title }}
            </el-menu-item>
          </el-scrollbar>
        </el-submenu>
        <el-menu-item v-else disabled index="1-1">Relations</el-menu-item>
        <el-submenu class="el-menu-item" index="1-2">
          <template slot="title">Actions</template>
          <el-menu-item v-for="(action, index) in actionsValue" :key="index" :index="action.name" @click="runAction(action)">
            {{ action.name }}
          </el-menu-item>
        </el-submenu>
        <el-menu-item index="1-3">References</el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
  <div v-else class="container-submenu">
    <el-menu :default-active="activeMenu" :router="false" class="el-menu-demo" mode="horizontal" menu-trigger="click" unique-opened>
      <el-submenu v-if="relations !== undefined" class="el-menu-item" index="1">
        <template slot="title">Relations</template>
        <el-scrollbar wrap-class="scroll">
          <item v-for="(relation, index) in relations" :key="index" :item="relation" />
        </el-scrollbar>
      </el-submenu>
      <el-menu-item v-else disabled index="1">Relations</el-menu-item>
      <el-submenu v-if="actions !== undefined" class="el-menu-item" index="2">
        <template slot="title">Actions</template>
        <template v-for="(action, index) in actions">
          <el-submenu v-if="action.childs" :key="index" :index="action.name">
            <template slot="title">{{ action.name }}</template>
            <el-menu-item v-for="(child, key) in action.childs" :key="key" :index="child.uuid" @click="runAction(child)">
              {{ child.name }}
            </el-menu-item>
          </el-submenu>
          <el-menu-item v-else :key="index" :index="action.name" @click="runAction(action)">
            {{ action.name }}
          </el-menu-item>
        </template>
      </el-submenu>
      <el-menu-item v-else disabled index="2">Actions</el-menu-item>
      <el-menu-item index="3">References</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import ResizeMixin from '@/layout/mixin/ResizeHandler'
import Item from './items'
export default {
  name: 'Submenu',
  components: {
    Item
  },
  mixins: [ResizeMixin],
  props: {
    report: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      relations: this.$store.getters.getRelations(this.$route.meta.parentUuid),
      actions: [],
      references: []
    }
  },
  computed: {
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
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
            this.$store.dispatch('setShowDialog', response)
          }).catch(err => {
            console.warn('ContextMenu: Dictionary Process (State) - Error ' + err.code + ': ' + err.message)
          })
      } else {
        this.$store.dispatch('setShowDialog', processData)
      }
    },
    subscribeChanges() {
      this.$store.subscribe(mutation => {
        if (mutation.type === 'reloadContextMenu') {
          this.actions = this.$store.getters.getActions(mutation.payload.containerUuid)
          if (typeof this.$route.meta.parentUuid !== 'undefined') {
            this.relations = this.$store.getters.getRelations(this.$route.meta.parentUuid)
          }
        }
      })
    },
    runAction(action) {
      if (action.type === 'action') {
        this.$notify.info({
          title: 'Info',
          message: 'Processing ' + action.name
        })
        this.$store.dispatch(action.action, {
          action: action,
          containerUuid: this.$route.meta.uuid
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
      } else if (action.type === 'process') {
        this.showModal(action)
      }
    }
  }
}
</script>

<style>
  .container-submenu-mobile{
    position: relative;
    z-index: 1;
    height: 39px !important;
    width: 39px !important;
    float: right;
  }

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

  .scroll {
    max-height: 400px;
  }

  .el-icon-more {
    transform: rotate(90deg);
  }
</style>
