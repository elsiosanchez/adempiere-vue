<template>
  <div v-if="isIndex" class="app-container">
    <el-row :gutter="10">
      <template v-if="optionList.children">
        <template v-for="(item, key) in optionList.children">
          <dropdown v-if="$route.name !== item.name" :key="key" :items="item" :title="item.meta.title" />
        </template>
      </template>
      <template v-else>
        <template v-for="(item, key) in optionList">
          <dropdown v-if="$route.name !== item.name" :key="key" :items="item" :title="item.meta.title" />
        </template>
      </template>
    </el-row>
  </div>
  <div v-else>
    <router-view />
  </div>
</template>
<script>
import Dropdown from '@/components/ADempiere/Dropdown'

export default {
  name: 'Summary',
  components: {
    Dropdown
  },
  data() {
    return {
      routes: this.$store.state.permission.addRoutes,
      parentUuid: this.$route.meta.parentUuid,
      optionList: []
    }
  },
  computed: {
    isIndex() {
      return this.$route.meta.isIndex
    }
  },
  beforeMount() {
    this.generateRoutesPool()
  },
  methods: {
    generateRoutesPool() {
      var routeParent = this.routes.find(route => route.name === this.parentUuid)
      if (routeParent === undefined) {
        this.optionList = this.$route.params.childs
      } else {
        if (routeParent.children && routeParent.children.length > 1) {
          this.optionList = routeParent
        } else {
          this.optionList = routeParent.children.find(child => child.name === this.$route.name)
        }
      }
    }
  }
}
</script>
