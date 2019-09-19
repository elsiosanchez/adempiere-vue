<template>
  <div>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
    <el-upload
      action="https://jsonplaceholder.typicode.com/posts/"
      list-type="picture-card"
      class="avatar-uploader"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
      :disabled="metadata.readonly || metadata.disabled"
    >
      <i class="el-icon-plus" />
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'ImageBase',
  props: {
    metadata: {
      type: Object,
      required: true
    },
    // value received from data result
    valueModel: {
      type: [String, Number],
      default: undefined
    }
  },
  data() {
    return {
      imageUrl: '',
      value: this.metadata.value,
      dialogImageUrl: '',
      dialogVisible: false
    }
  },
  computed: {
    getterValue() {
      var field = this.$store.getters.getFieldFromColumnName(this.metadata.containerUuid, this.metadata.columnName)
      if (field) {
        return field.value
      }
      return undefined
    }
  },
  watch: {
    valueModel(value) {
      this.value = value
    },
    '$route.query.action'(actionValue) {
      if (actionValue === 'create-new') {
        this.value = this.metadata.defaultValue
      }
    }
  },
  beforeMount() {
    console.log(this.getterValue)
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined) {
      this.value = this.valueModel
    }
  },
  methods: {
    handlePictureCardPreview(file) {
      console.log(file, 'hp')
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleChange(value) {
      if (this.metadata.inTable) {
        this.$store.dispatch('notifyCellTableChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value,
          keyColumn: this.metadata.keyColumn,
          tableIndex: this.metadata.tableIndex,
          rowKey: this.metadata.rowKey,
          panelType: this.metadata.panelType
        })
      } else if (this.metadata.panelType === 'table') {
        this.$store.dispatch('notifyFieldChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value,
          isDontSendToEdit: false,
          panelType: this.metadata.panelType
        })
      } else {
        this.$store.dispatch('notifyFieldChange', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          newValue: this.value
        })
        console.log(this.value)
      }
    },
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
      console.log(res)
      this.$store.dispatch('getqlq', {
        qlq: file
      })
      console.log(file)
    },
    beforeAvatarUpload(file) {
      console.log(file)
      this.$store.dispatch('notifyFieldChange', {
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        columnName: this.metadata.columnName,
        newValue: file
      })
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      // const isGIF = file.type === 'image/gif'
      // const isBMP = file.type === 'image/bmp'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isLt2M) {
        this.$message.error(this.$t('components.imageError'))
      }
      return isJPG + isPNG + isLt2M
    }
  }
}
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
