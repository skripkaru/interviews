<script setup lang="ts">
import { computed, markRaw, onMounted, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLoading } from '@/composables/useLoading'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import type { IMenuItem } from '@/interfaces'
import { House, List, PieChart, Plus, User } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const { startLoading, stopLoading } = useLoading()

const items = ref<IMenuItem[]>([
  {
    label: 'Авторизация',
    icon: markRaw(User),
    path: '/auth',
    show: computed((): boolean => !userStore.userId)
  },
  {
    label: 'Новое собеседование',
    icon: markRaw(Plus),
    path: '/',
    show: computed((): boolean => !!userStore.userId)
  },
  {
    label: 'Список собеседований',
    icon: markRaw(List),
    path: '/list',
    show: computed((): boolean => !!userStore.userId)
  },
  {
    label: 'Статистика',
    icon: markRaw(PieChart),
    path: '/statistic',
    show: computed((): boolean => !!userStore.userId)
  }
])

onMounted(() => {
  startLoading()
  onAuthStateChanged(getAuth(), (user) => {
    if (user) {
      userStore.userId = user.uid
    } else {
      userStore.userId = ''
    }
   stopLoading()
  })
})

const signOutMethod = async (): Promise<void> => {
  await signOut(getAuth())
  await router.push('/auth')
}
</script>

<template>
  <el-container class="layout">
    <el-header>
      <el-menu mode="horizontal" :default-active="'/'" :ellipsis="false" :router="true">
        <template v-for="(item, index) in items">
          <el-menu-item v-if="item.show" :index="item.path" :key="index">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            {{ item.label }}
          </el-menu-item>
        </template>
        <el-menu-item v-if="userStore.userId" @click="signOutMethod">
          <el-icon>
            <House />
          </el-icon>
          Выход
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
}
</style>
