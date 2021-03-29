<template>
  <div class="container-submenu-mobile container-context-menu">
    <!-- actions or process on container -->
    <el-dropdown size="mini" split-button @click="runAction(defaultActionToRun)" @command="clickRunAction">
      {{ defaultActionName }}
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(action, index) in actions"
          :key="index"
          :command="action"
        >
          {{ action.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <!-- menu relations -->
    <el-dropdown size="mini" @command="clickRelation">
      <el-button size="mini">
        {{ $t('components.contextMenuRelations') }} <i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(relation, index) in relationsList"
          :key="index"
          :command="relation"
        >
          {{ relation.meta.title }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dropdown size="mini">
      <el-button size="mini" :disabled="!(isReferecesContent && isLoadedReferences)">
        {{ $t('components.contextMenuReferences') }} <i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(reference, index) in references.referencesList"
          :key="index"
        >
          {{ reference.displayName }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import contextMixin from './contextMenuMixin.js'

export default {
  name: 'ContextMenuMobile',
  mixins: [
    contextMixin
  ],
  data() {
    return {
      openedsMenu: [
        'actions'
      ]
    }
  },
  computed: {
    isPanelTypeMobile() {
      if (['process', 'report'].includes(this.$route.meta.type)) {
        return true
      }
      return false
    },
    isUndoAction() {
      if (this.isWindow) {
        if (!this.isWithRecord) {
          return true
        }
      }
      return false
    },
    typeOfAction() {
      if (this.isUndoAction) {
        return 'warning'
      }
      return 'default'
    },
    isPlain() {
      if (this.isUndoAction) {
        return true
      }
      return false
    },
    defaultActionToRun() {
      if (this.isUndoAction) {
        return this.actions[2]
      }
      return this.actions[0]
    },
    defaultActionName() {
      if (this.isWindow) {
        if (this.isWithRecord) {
          return this.$t('window.newRecord')
        }
        return this.$t('data.undo')
      }
      return this.$t('components.RunProcess')
    },
    iconDefault() {
      if (this.isPanelTypeMobile) {
        return 'component'
      }
      return 'skill'
    }
  },
  methods: {
    clickRelation(item) {
      this.$router.push({
        name: item.name,
        query: {
          tabParent: 0
        }
      }, () => {})
    },
    clickRunAction(action) {
      this.runAction(action)
    }
  }
}
</script>

<style scoped>
  .el-dropdown .el-button-group {
    display: flex;
  }
  .svg-icon {
    width: 1em;
    height: 2em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
</style>
