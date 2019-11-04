<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span> {{ $t('profile.recentItems') }} </span>
      <el-input
        v-model="search"
        size="mini"
        :placeholder="$t('table.dataTable.search')"
        class="search_recent"
      />
    </div>
    <div class="recent-items">
      <el-table
        :data="search.length ? filterResult(search) : recentItems"
        @row-click="handleClick"
      >
        <el-table-column
          type="index"
          width="20"
        />
        <el-table-column
          :label="$t('profile.recentItems')"
          prop="displayName"
        />
      </el-table>
    </div>
  </el-card>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'RecentItems',
  data() {
    return {
      recentItems: [],
      isLoaded: true,
      search: '',
      accentRegexp: /[\u0300-\u036f]/g
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
      this.$router.push({ name: row.menuUuid, query: { action: (row.uuidRecord) ? row.uuidRecord : 'create-new', tabParent: 0 }})
    },
    subscribeChanges() {
      this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'setRecentItems') {
          this.recentItems = this.getterRecentItems
        }
      })
    },
    filterResult(search) {
      return this.recentItems.filter(item => this.ignoreAccent(item.displayName).toLowerCase().includes(this.ignoreAccent(search.toLowerCase())))
    },
    ignoreAccent(s) {
      if (!s) { return '' }
      return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    }
  }
}
</script>

<style scoped>
  .search_recent {
    width: 50%!important;
    float: right;
  }
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
