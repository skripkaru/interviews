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
      userStore.setUser(user)
    } else {
      userStore.setUser(null)
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
      <el-menu class="menu" :collapse="isCollapse" :router="true">
        <template v-for="(item, index) in items">
          <el-menu-item v-if="item.show" :index="item.path" :key="index">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <template #title>{{ item.label }}</template>
          </el-menu-item>
        </template>
        <el-menu-item class="logout" v-if="userStore.userId" @click="signOutMethod">
          <el-icon>
            <SwitchButton />
          </el-icon>
          <template #title>Выход</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <el-button
          class="collapse"
          v-if="userStore.userId"
          @click="isCollapse = !isCollapse"
          :icon="Expand"
          text
        />
        <el-text v-if="userStore.userId && userStore.userName">
          <el-icon>
            <User />
          </el-icon>
          {{ userStore.userName }}
        </el-text>
      </el-header>
      <el-main class="main">
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

.menu {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logout {
  margin-top: auto;
}

.collapse {
  margin-right: auto;
}
</style>
