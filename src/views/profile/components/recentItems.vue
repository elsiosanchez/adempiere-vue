<template>
  <div class="block">
    <el-timeline>
      <el-timeline-item v-for="(item, index) of recentItems" :key="index" placement="top" type="primary" size="large" :timestamp="String(item.updated)">
        <el-card>
          <router-link :to="{ name: item.menuUuid }">
            <h4>
              {{ item.displayName }}
              <el-tag v-show="checkOpened(item.menuUuid)">{{ $t('notifications.Opened') }}</el-tag>
            </h4>
            <!-- <ul>
              <li v-show="item.menuName !==''">
                Menu Name: {{ item.menuName }}
              </li>
              <li v-show="item.menuUuid !==''">
                Menu UUID: {{ item.menuUuid }}
              </li>
              <li v-show="item.windowUuid !==''">
                Window UUID: {{ item.windowUuid }}
              </li>
              <li v-show="item.tableId !==0">
                Table ID: {{ item.tableId }}
              </li>
              <li v-show="item.recordId !==0">
                Record ID: {{ item.recordId }}
              </li>
              <li v-show="item.tabUuid !==''">
                Tab UUID: {{ item.tabUuid }}
              </li>
            </ul> -->
          </router-link>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
export default {
  name: 'RecentItems',
  data() {
    return {
      recentItems: []
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
    checkOpened(uuid) {
      return this.cachedViews.includes(uuid)
    },
    getRecentItems() {
      var items = this.getterRecentItems
      if (items === undefined || items.length < 1) {
        this.$store.dispatch('getRecentItemsFromServer')
          .then(response => {
            this.recentItems = response
          }).catch(error => {
            console.log(error)
          })
      } else {
        this.recentItems = items
      }
    }
  }
}
</script>
