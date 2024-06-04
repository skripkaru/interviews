<script setup lang="ts">
import { computed, markRaw, onMounted, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLoading } from '@/composables/useLoading'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import type { IMenuItem } from '@/interfaces'
import { PieChart, Plus, User, Expand, Document, SwitchButton } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const { startLoading, stopLoading } = useLoading()

const isCollapse = ref(true)
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
  },
  {
    label: 'Профиль',
    icon: markRaw(User),
    path: '/profile',
    show: computed((): boolean => !!userStore.userId)
  }
])

onMounted(() => {
  startLoading()
  const auth = getAuth()
  onAuthStateChanged(auth, (user: FirebaseUser | null) => {
    if (user) {
      userStore.setUser(user)
    } else {
      userStore.setUser(null)
    }
    stopLoading()
  })
})

const signOutMethod = async (): Promise<void> => {
  const auth = getAuth()
  await signOut(auth)
  await router.push('/auth')
}
</script>

<template>
  <el-container class="layout">
    <el-aside v-if="userStore.userId" class="aside" :width="isCollapse ? '44px' : '200px'">
      <el-menu class="menu" :default-active="$route.path" :collapse="isCollapse" router>
        <template v-for="(item, index) in items">
          <el-menu-item v-if="item.show" :index="item.path" :key="index">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </template>
        <el-menu-item class="logout" v-if="userStore.userId" @click="signOutMethod">
          <el-icon>
            <SwitchButton />
          </el-icon>
          <span>Выход</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <el-button class="collapse" v-if="userStore.userId" @click="isCollapse = !isCollapse" link>
          <el-icon size="24">
            <Expand />
          </el-icon>
        </el-button>
        <el-button v-if="userStore.userId" @click="$router.push('/profile')" link>
          {{ userStore.userName }}
          <el-avatar
            class="el-icon--right"
            v-if="userStore.userPhoto"
            :src="userStore.userPhoto"
            size="small"
          />
          <el-avatar class="el-icon--right" v-else size="small">
            {{ userStore.userName.charAt(0) }}
          </el-avatar>
        </el-button>
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-menu-border-color);
}

.logout {
  margin-top: auto;
}

.collapse {
  margin-right: auto;
}

.el-menu-item {
  --el-menu-base-level-padding: 10px;
}
</style>
