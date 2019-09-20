<template>
  <div class="recent-items">
    <!-- <div class="header">
      <el-input v-model="search" :placeholder="$t('table.recentItems.search')" />
    </div>
    <el-table
      v-loading="isLoaded"
      :data="recentItems.filter(data => !search || data.displayName.toLowerCase().includes(search.toLowerCase()) || data.description.toLowerCase().includes(search.toLowerCase()) || String(data.updated).toLowerCase().includes(search.toLowerCase()))"
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
    </el-table> -->
    <el-card
      v-for="(item, index) in recentItems"
      :key="index"
      shadow="never"
      class="card-box"
      @click.native="handleClick(item)"
    >
      <span class="card-content">{{ item.displayName }}</span><br>
      <time class="time">{{ item.updated }}</time>
    </el-card>
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
    this.subscribeChanges()
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
      this.$router.push({ name: row.menuUuid, query: { action: (row.uuidRecord) ? row.uuidRecord : 'create-new' }})
    },
    subscribeChanges() {
      this.$store.subscribe((mutation, state) => {
        // The mutation comes in the format of `{ type, payload }`.
        if (mutation.type === 'setRecentItems') {
          this.recentItems = this.getterRecentItems
        }
      })
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
  .time {
    float: right;
    font-size: 11px;
    color: #999;
  }
  .card-box {
    cursor: pointer;
  }
  .card-content {
    font-size: 15px;
  }
</style>
