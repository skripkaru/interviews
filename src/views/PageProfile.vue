<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useLoading } from '@/composables/useLoading'
import { getAuth, updateProfile, updateEmail } from 'firebase/auth'
import { ElNotification } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const storage = getStorage()
const userStore = useUserStore()
const { startLoading, stopLoading } = useLoading()

const email = ref<string>(userStore.userEmail)
const name = ref<string>(userStore.userName)
const photo = ref<string>(userStore.userPhoto)

const selectedFile = ref<File | null>(null)

const handleFileChange = (file: File) => {
  selectedFile.value = file
  photo.value = URL.createObjectURL(file)
}

const uploadPhoto = async (file: File) => {
  const storageReference = storageRef(storage, `photos/${file.name}`)
  await uploadBytes(storageReference, file)
  return await getDownloadURL(storageReference)
}

const changeProfile = async () => {
  startLoading()
  try {
    const auth = getAuth()
    const user = auth.currentUser

    if (user) {
      let photoURL = photo.value
      if (selectedFile.value) {
        photoURL = await uploadPhoto(selectedFile.value)
      }

      await updateProfile(user, {
        displayName: name.value,
        photoURL: photoURL
      })
      await updateEmail(user, email.value)
      userStore.setUser(user)
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      ElNotification({
        title: 'Error',
        message: error.message,
        type: 'error'
      })
    }
  } finally {
    stopLoading()
  }
}
</script>

<template>
  <el-row justify="center">
    <el-col :xs="24" :sm="16" :md="12" :lg="10" :xl="8">
      <el-card>
        <template #header>
          <h1>Профиль</h1>
        </template>
        <el-form label-position="top">
          <el-form-item>
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="handleFileChange"
            >
              <img v-if="photo" :src="photo" class="avatar" alt="" />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="Имя">
            <el-input v-model="name" type="text" placeholder="Имя" />
          </el-form-item>
          <el-form-item label="Email">
            <el-input v-model="email" type="text" placeholder="Email" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="changeProfile"> Сохранить</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.avatar-uploader .avatar {
  width: 160px;
  height: 160px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 160px;
  height: 160px;
  text-align: center;
}
</style>
