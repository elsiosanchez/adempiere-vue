<template>
  <el-menu-item
    v-if="item.meta.type !== 'summary'"
    v-show="item.meta.uuid!==$route.meta.uuid"
    :index="item.meta.uuid"
    @click="handleClick(item)"
  >
    <svg-icon v-if="item.meta.type === 'window'" icon-class="tab" /> <svg-icon v-if="item.meta.type === 'report'" icon-class="skill" /> <svg-icon v-if="item.meta.type === 'browser'" icon-class="search" />{{ item.meta.title }}
  </el-menu-item>
  <el-submenu v-else v-show="!item.hidden" :index="item.meta.title" popper-append-to-body>
    <template slot="title">
      <svg-icon icon-class="nested" /> {{ item.meta.title }}
    </template>
    <el-scrollbar wrap-class="scroll">
      <item v-for="(child, key) in item.children" :key="key" :item="child">
        {{ child.meta.title }}
      </item>
    </el-scrollbar>
  </el-submenu>
</template>

<script>
export default {
  name: 'Item',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleClick(item) {
      this.$router.push({ name: item.name, query: { action: 'create-new' }})
    }
  }
}
</script>

<style>
	.scroll {
    max-height: 400px;
  }
</style>
