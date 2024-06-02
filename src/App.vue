<script setup lang="ts">
import { computed, markRaw, onMounted, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLoading } from '@/composables/useLoading'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import type { IMenuItem } from '@/interfaces'
import { PieChart, Plus, User, Expand, Document, SwitchButton } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const { startLoading, stopLoading } = useLoading()

const items = ref<IMenuItem[]>([
  // {
  //   label: 'Войти',
  //   icon: markRaw(User),
  //   path: '/auth',
  //   show: computed((): boolean => !userStore.userId)
  // },
  {
    label: 'Добавить',
    icon: markRaw(Plus),
    path: '/',
    show: computed((): boolean => !!userStore.userId)
  },
  {
    label: 'Собеседования',
    icon: markRaw(Document),
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

const isCollapse = ref(true)

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
    <el-aside v-if="userStore.userId" class="aside" :width="isCollapse ? '64px' : '200px'">
      <el-menu style="height: 100%" :collapse="isCollapse" :router="true">
        <template v-for="(item, index) in items">
          <el-menu-item v-if="item.show" :index="item.path" :key="index">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <template #title>{{ item.label }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div>
          <el-button
            v-if="userStore.userId"
            @click="isCollapse = !isCollapse"
            :icon="Expand"
            text
          />
        </div>
        <el-button v-if="userStore.userId" @click="signOutMethod" :icon="SwitchButton" text>
          Выход
        </el-button>
        <el-button v-else @click="router.push('/auth')" :icon="User" text>Вход</el-button>
      </el-header>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.aside {
  transition: width var(--el-transition-duration);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
