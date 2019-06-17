<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      windowWidth: 0,
      windowHeight: 0
    }
  },
  mounted() {
    this.$nextTick(function() {
      window.addEventListener('resize', this.getWindowWidth)
      window.addEventListener('resize', this.getWindowHeight)

      this.getWindowWidth()
      this.getWindowHeight()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getWindowWidth)
    window.removeEventListener('resize', this.getWindowHeight)
  },
  methods: {
    getWindowWidth(event) {
      this.windowWidth = document.documentElement.clientWidth
      this.$store.dispatch('setWidth', this.windowWidth)
    },
    getWindowHeight(event) {
      this.windowHeight = document.documentElement.clientHeight
      this.$store.dispatch('setHeight', this.windowHeight)
    }
  }
}
</script>
