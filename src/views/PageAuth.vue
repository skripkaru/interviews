<script setup lang="ts">
import { ref, computed } from 'vue'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useLoading } from '@/composables/useLoading'
import { useRouter } from 'vue-router'
import { User } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'

const router = useRouter()
const { startLoading, stopLoading } = useLoading()

const email = ref<string>('')
const password = ref<string>('')
const isLogin = ref<boolean>(true)

const subtitleText = computed<string>(() => {
  return isLogin.value ? 'Аккаунта еще нет?' : 'Уже есть аккаунт?'
})

const linkAccountText = computed<string>(() => {
  return isLogin.value ? 'Создайте сейчас' : 'Войдите в него'
})

const submitButtonText = computed<string>(() => {
  return isLogin.value ? 'Вход' : 'Регистрация'
})

const toggleAuth = () => {
  isLogin.value = !isLogin.value
}

const signUp = async (): Promise<void> => {
  startLoading()
  try {
    await createUserWithEmailAndPassword(getAuth(), email.value, password.value)
    await router.push('/')
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

const signIn = async (): Promise<void> => {
  startLoading()
  try {
    await signInWithEmailAndPassword(getAuth(), email.value, password.value)
    await router.push('/')
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

const submitForm = () => {
  if (isLogin.value) {
    signIn()
  } else {
    signUp()
  }
}
</script>

<template>
  <el-card class="card">
    <template #header>
      <h1 class="title">{{ submitButtonText }}</h1>
      <el-text class="text">
        {{ subtitleText }}
        <el-link type="primary" @click="toggleAuth">{{ linkAccountText }}</el-link>
      </el-text>
    </template>
    <el-form label-position="top" @submit.prevent="submitForm">
      <el-form-item label="Email">
        <el-input v-model="email" type="text" placeholder="Email" />
      </el-form-item>
      <el-form-item label="Пароль">
        <el-input v-model="password" type="password" placeholder="Пароль" />
      </el-form-item>
      <el-button style="width: 100%" native-type="submit" :icon="User">
        {{ submitButtonText }}
      </el-button>
    </el-form>
  </el-card>
</template>

<style scoped>
.card {
  max-width: 400px;
  margin: 0 auto;
}

.title {
  margin-top: 0;
}

.text {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
