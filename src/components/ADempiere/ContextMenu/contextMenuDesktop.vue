<template>
  <div class="container-submenu container-context-menu">
    <el-menu :default-active="activeMenu" :router="false" class="el-menu-demo" mode="horizontal" menu-trigger="hover" unique-opened>
      <template>
        <el-submenu v-if="relations !== undefined && relations.length > 0" class="el-menu-item" index="1">
          <template slot="title">
            {{ $t('components.contextMenuRelations') }}
          </template>
          <el-scrollbar wrap-class="scroll">
            <item v-for="(relation, index) in relations" :key="index" :item="relation" />
          </el-scrollbar>
        </el-submenu>
        <el-menu-item v-else disabled index="1">
          {{ $t('components.contextMenuRelations') }}
        </el-menu-item>
        <el-submenu v-if="actions !== undefined && actions.length > 0" class="el-menu-item" index="2" @click.native="runAction(actions[0])">
          <template slot="title">
            {{ $t('components.contextMenuActions') }}
          </template>
          <template v-for="(action, index) in actions">
            <el-submenu v-if="action.childs" :key="index" :index="action.name" :disabled="action.disabled">
              <template slot="title">
                {{ action.name }}
              </template>
              <el-menu-item v-for="(child, key) in action.childs" :key="key" :index="child.uuid" @click="runAction(child)">
                {{ child.name }}
              </el-menu-item>
            </el-submenu>
            <el-menu-item v-else :key="index" :index="action.name" :disabled="action.disabled" @click="runAction(action)">
              {{ action.name }}
            </el-menu-item>
          </template>
          <el-menu-item v-show="isReport" index="4">
            <a :href="downloads" :download="file">
              {{ $t('components.contextMenuDownload') }}
            </a>
          </el-menu-item>
        </el-submenu>
        <el-menu-item v-else disabled index="2">
          {{ $t('components.contextMenuActions') }}
        </el-menu-item>
        <el-menu-item index="3" :disabled="!(isReferecesContent && references.length > 0)">
          {{ $t('components.contextMenuReferences') }}
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script>
import { contextMixin } from '@/components/ADempiere/ContextMenu/contextMenuMixin'

export default {
  name: 'ContextMenuDesktop',
  mixins: [contextMixin]
}
</script>

<style scoped>
  .el-submenu .el-menu-item {
    height: 50px;
    line-height: 50px;
    padding-left: 27px !important;
    padding: 0 45px;
    min-width: 200px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
<style>
  .Run-Report {
    position: absolute;
    right: 102%;
    border: 0;
  }
  .icon-menu {
    position: absolute;
    right: 140%;
    margin-top: -38%;
  }
  .List-Report {
    border: 0;
    background: transparent;
  }
  .container-context-menu {
    z-index: 1;
  }

  .container-submenu {
    position: absolute;
    height: 39px !important;
    right: 0;
    top: -1px;
  }

  ul.el-menu-demo > .el-menu-item {
    height: 39px !important;
    line-height: 39px !important;
    padding: 0 10px;
  }

  .el-menu-demo > .el-menu-item > .el-submenu__title {
    line-height: 39px;
    height: 39px !important;
    padding: 0;
  }

  .el-menu--horizontal .el-submenu > .el-menu--horizontal {
    left: initial !important;
    right: 150px;
  }

  .el-menu--popup-bottom-start {
    min-width: 150px !important;
  }

  .el-menu--popup-right-start{
    min-width: 150px !important;
  }

  .el-menu--popup-right-start > .el-menu-item {
    min-width: 150px;
  }

  .scroll {
    max-height: 400px;
  }

  .el-icon-more {
    transform: rotate(90deg);
  }
</style>
