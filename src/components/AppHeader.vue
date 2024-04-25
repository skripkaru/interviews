<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

interface IMenuItem {
  label: string
  icon: string
  path: string
  show: ComputedRef<boolean>
}

const items = ref<IMenuItem[]>([
  {
    label: 'Авторизация',
    icon: 'pi pi-user',
    path: '/auth',
    show: computed((): boolean => !userStore.userId),
  },
  {
    label: 'Добавить',
    icon: 'pi pi-plus',
    path: '/',
    show: computed((): boolean => !!userStore.userId),
  },
  {
    label: 'Список собеседований',
    icon: 'pi pi-list',
    path: '/list',
    show: computed((): boolean => !!userStore.userId),
  },
  {
    label: 'Статистика',
    icon: 'pi pi-chart-pie',
    path: '/statistic',
    show: computed((): boolean => !!userStore.userId),
  },
])
</script>

<template>
  <AppMenuBar :model="items" class="menu">
    <template #item="{item, props}">
      <template v-if="item.show">
        <RouterLink :to="item.path" class="flex align-items-center" v-bind="props.action">
          <span :class="item.icon" class="p-menuitem-icon"></span>
          <span class="ml-2">{{item.label}}</span>
        </RouterLink>
      </template>
    </template>
    <template #end>
      <span v-if="userStore.userId" @click="userStore.userId = ''" class="flex align-items-center menu-exit">
        <span class="pi pi-sign-out p-menuitem-icon"></span>
        <span class="ml-2">Выход</span>
      </span>
    </template>
  </AppMenuBar>
</template>

<style scoped>
  .menu {
    margin: 30px 0;
  }

  .menu-exit {
    cursor: pointer;
  }
</style>