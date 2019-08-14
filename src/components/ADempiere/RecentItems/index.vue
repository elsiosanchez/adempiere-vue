<template>
  <div class="recent-items">
    <div class="header">
      <el-input v-model="search" :placeholder="$t('table.recentItems.search')" />
    </div>
    <el-table
      v-loading="isLoaded"
      :data="recentItems.filter(data => !search || data.displayName.toLowerCase().includes(search.toLowerCase()) || data.description.toLowerCase().includes(search.toLowerCase()) || String(data.updated).toLowerCase().includes(search.toLowerCase()))"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @row-click="handleClick"
    >
      <el-table-column :label="$t('table.recentItems.date')">
        <template slot-scope="{row}">
          <span>{{ row.updated | parseTime('{d}-{m}-{y} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.recentItems.name')" prop="displayName" sortable />
      <el-table-column :label="$t('table.recentItems.description')" prop="description" sortable />
    </el-table>
  </div>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'RecentItems',
  data() {
    return {
      recentItems: [],
      isLoaded: true,
      search: ''
    }
  },
  computed: {
    getterRecentItems() {
      return this.$store.getters.getRecentItems
    },
    cachedViews() {
      return this.$store.getters.cachedViews
    }
  },
  mounted() {
    this.getRecentItems()
  },
  methods: {
    parseTime,
    checkOpened(uuid) {
      return this.cachedViews.includes(uuid)
    },
    getRecentItems() {
      var items = this.getterRecentItems
      if (items === undefined || items.length < 1) {
        this.$store.dispatch('getRecentItemsFromServer')
          .then(response => {
            this.recentItems = response
            this.isLoaded = false
          }).catch(error => {
            console.log(error)
          })
      } else {
        this.recentItems = items
        this.isLoaded = false
      }
    },
    handleClick(row) {
      this.$router.push({ name: row.menuUuid, params: { action: (row.uuidRecord) ? row.uuidRecord : 'create-new' }})
    }
  }
}
</script>
<style scoped>
	.header {
		padding-bottom: 10px;
	}
	.recent-items {
		height: 455px;
		overflow: auto;
	}
</style>
