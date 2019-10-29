<template>
  <div>
    <el-upload
      :ref="metadata.columnName"
      with-credentials
      action="https://jsonplaceholder.typicode.com/posts/"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
      :disabled="isDisabled"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
    <!-- <el-upload
      :show-file-list="false"
      :before-upload="beforeAvatarUpload"
      class="avatar-uploader"
      action="https://jsonplaceholder.typicode.com/posts/"
      :disabled="metadata.readonly || metadata.disabled"
    >
      <img v-if="imageUrl" :src="imageUrl" class="avatar">
      <i v-else class="el-icon-plus avatar-uploader-icon" />
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog> -->
  </div>
</template>

<script>
import { fieldMixin } from '@/components/ADempiere/Field/FieldMixin'

export default {
  name: 'FieldImage',
  mixins: [fieldMixin],
  data() {
    return {
      imageUrl: '',
      dialogImageUrl: '',
      dialogVisible: false
    }
  },
  watch: {
    valueModel(value) {
      this.value = value
    },
    'metadata.value'(value) {
      this.value = value
    }
  },
  beforeMount() {
    // enable to dataTable records
    if (this.metadata.inTable && this.valueModel !== undefined) {
      this.value = this.valueModel
    }
  },
  methods: {
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    beforeAvatarUpload(file) {
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
    },
    activeFocus(columnName) {
      if (this.metadata.isUpdateable) {
        this.$refs[columnName].focus()
      }
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
