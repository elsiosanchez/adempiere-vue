<template>
  <el-form>
    <el-form-item label="Current Rol">
      {{ getRol.name }}
    </el-form-item>

    <el-form-item label="Client Name">
      {{ getRol.clientName }}
    </el-form-item>

    <el-form-item label="Description">
      {{ getRol.description }}
    </el-form-item>

    <el-form-item label="Change Rol">
      <el-select
        v-model="value"
        :filterable="true"
        value-key="key"
        @change="handleChange"
      >
        <el-option
          v-for="(item, key) in getRoles"
          :key="key"
          :label="item.name"
          :value="item.uuid"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'ProfileRole',
  data() {
    return {
      value: '',
      options: []
    }
  },
  computed: {
    getRol() {
      return this.$store.getters['user/getRol']
    },
    getRoles() {
      return this.$store.getters['user/getRoles']
    }
  },
  created() {
    this.value = this.getRol.uuid
  },
  methods: {
    handleChange(valueSelected) {
      this.$store.dispatch('user/changeRoles', valueSelected)
        .then(response => {
          this.$store.dispatch('permission/generateRoutes', response.name)
          console.log(response)
        })
    }
  }
}
</script>
