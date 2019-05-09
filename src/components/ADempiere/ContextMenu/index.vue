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
          <el-menu-item v-for="(action, index) in actions" :key="index" :index="action.name" @click="runAction(action)">
            {{ action.name }}
          </el-menu-item>
        </el-submenu>
        <el-menu-item index="1-3">References</el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
  <div v-else class="container-submenu">
    <el-menu :default-active="activeMenu" :router="false" class="el-menu-demo" mode="horizontal" menu-trigger="click">
      <el-submenu v-if="relations.length > 0" class="el-menu-item" index="1">
        <template slot="title">Relations</template>
        <el-scrollbar wrap-class="scroll">
          <el-menu-item v-for="(relation, index) in relations" v-show="relation.meta.type!=='summary' && relation.meta.uuid!==$route.meta.uuid" :key="index" :index="relation.meta.uuid" @click="handleClick(relation)">
            {{ relation.meta.title }}
          </el-menu-item>
        </el-scrollbar>
      </el-submenu>
      <el-menu-item v-else disabled index="1">Relations</el-menu-item>
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
            this.$emit('showModal', response)
          }).catch(err => {
            console.warn('ContextMenu: Dictionary Process (State) - Error ' + err.code + ': ' + err.message)
          })
      } else {
        this.$emit('showModal', processData)
      }
    },
    subscribeChanges() {
      this.$store.subscribe(mutation => {
        if (mutation.type === 'reloadContextMenu') {
          this.actions = this.$store.getters.getActions(mutation.payload.containerUuid)
          this.relations = this.$store.getters.getRelations(this.$route.meta.parentUuid)
          this.relations.find(item => console.log(item))
        }
      })
    },
    runAction(action) {
      if (action.type === 'action') {
        this.$store.dispatch(action.action, {
          action: action,
          containerUuid: this.$route.meta.uuid
        })
      } else if (action.type === 'P') {
        this.showModal(action)
      }
    },
    handleClick(item) {
      this.$router.push({ name: item.name })
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
