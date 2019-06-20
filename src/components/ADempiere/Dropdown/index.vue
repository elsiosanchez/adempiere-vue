<template>
  <div :class="{active:isActive}" class="share-dropdown-menu">
    <div class="share-dropdown-menu-wrapper">
      <span class="share-dropdown-menu-title" @click.self="clickTitle">{{ title }}</span>
      <template v-for="(item, index) in items">
        <router-link v-if="!item.hidden" :key="index" :to="{name: item.name}" class="share-dropdown-menu-item">
          <svg-icon :icon-class="item.meta.icon" />
          {{ item.meta.title }}
        </router-link>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dropdown',
  props: {
    items: {
      type: Array,
      default: function() {
        return []
      }
    },
    title: {
      type: String,
      default: 'vue'
    }
  },
  data() {
    return {
      isActive: false
    }
  },
  methods: {
    clickTitle() {
      this.isActive = !this.isActive
    }
  }
}
</script>

<style lang="scss" >
$n: 15; //和items.length 相同
$t: .1s;
.share-dropdown-menu {
  width: 200px;
  position: relative;
  z-index: 1;
  &-title {
    width: 100%;
    display: block;
    cursor: pointer;
    background: #42b983;
    color: white;
    height: 50px;
    line-height: 40px;
    font-size: 15px;
    text-align: center;
    z-index: 2;
    transform: translate3d(0,0,0);
  }
  &-wrapper {
    position: relative;
  }
  &-item {
    text-align: center;
    position: absolute;
    width: 100%;
    background: #e0e0e0;
    line-height: 35px;
    height: 35px;
    cursor: pointer;
    font-size: 15px;
    opacity: 1;
    transition: transform 0.28s ease;
    &:hover {
      background: rgba(66,185,131, 0.90);
      color: white;
    }
    @for $i from 1 through $n {
      &:nth-of-type(#{$i}) {
        z-index: -1;
        transition-delay: $i*$t;
        transform: translate3d(0, -35px, 0);
      }
    }
  }
  &.active {
    .share-dropdown-menu-wrapper {
      z-index: 1;
    }
    .share-dropdown-menu-item {
      @for $i from 1 through $n {
        &:nth-of-type(#{$i}) {
         transition-delay: ($n - $i)*$t;
          transform: translate3d(0, ($i - 1)*35px, 0);
        }
      }
    }
  }
}
</style>
