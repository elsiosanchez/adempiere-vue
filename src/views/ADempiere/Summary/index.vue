<template>
  <div v-if="isIndex" class="app-container">
    <el-row type="flex" justify="space-around">
      <template v-for="(item, key) in optionList.children">
        <el-col v-if="$route.name !== item.name" :key="key" :span="4">
          <dropdown :items="item.children" style="margin:0 auto;" :title="item.meta.title" />
        </el-col>
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
      optionList: [],
      articleList: [
        { title: '基础篇', href: 'https://juejin.im/post/59097cd7a22b9d0065fb61d2' },
        { title: '登录权限篇', href: 'https://juejin.im/post/591aa14f570c35006961acac' },
        { title: '实战篇', href: 'https://juejin.im/post/593121aa0ce4630057f70d35' },
        { title: 'vue-admin-template 篇', href: 'https://juejin.im/post/595b4d776fb9a06bbe7dba56' },
        { title: 'v4.0 篇', href: 'https://juejin.im/post/5c92ff94f265da6128275a85' },
        { title: '优雅的使用 icon', href: 'https://juejin.im/post/59bb864b5188257e7a427c09' }
      ]
    }
  },
  computed: {
    isIndex() {
      return this.$route.meta.isIndex
    }
  },
  mounted() {
    this.optionList = this.routes.find(
      route => route.name === this.parentUuid
    )
    console.log(this.optionList)
  }
}
</script>
