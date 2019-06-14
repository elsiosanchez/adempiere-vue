<template>
  <div class="block">
    <el-timeline>
      <el-timeline-item v-for="(item, index) of recentItems" :key="index" placement="top">
        <el-card>
          <router-link :to="{ name: item.menuUuid }">
            <h4>{{ item.displayName }}</h4>
            <!-- <ul>
              <li>
                Menu Name: {{ item.menuName }}
              </li>
              <li>
                Menu UUID: {{ item.menuUuid }}
              </li>
              <li>
                Window UUID: {{ item.windowUuid }}
              </li>
              <li>
                Table ID: {{ item.tableId }}
              </li>
              <li>
                Record ID: {{ item.recordId }}
              </li>
              <li>
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
    }
  },
  mounted() {
    this.getRecentItems()
  },
  methods: {
    getRecentItems() {
      var items = this.getterRecentItems
      if (typeof items === 'undefined' || items.length < 1) {
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
