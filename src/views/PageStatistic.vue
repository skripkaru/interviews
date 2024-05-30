<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import { useLoading } from '@/composables/useLoading'
import type { IInterview } from '@/interfaces'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { ChartData } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const userStore = useUserStore()
const db = getFirestore()
const { startLoading, stopLoading } = useLoading()

const interviews = ref<IInterview[]>([])
const chartData = ref<ChartData<'pie'>>({
  datasets: []
})
const chartOptions = ref()

onMounted(async () => {
  startLoading()
  interviews.value = await getAllInterviews()
  chartData.value = setChartData()
  chartOptions.value = setChartOptions()
  stopLoading()
})

const getAllInterviews = async <T extends IInterview>(): Promise<T[]> => {
  const getData = query(
    collection(db, `users/${userStore.userId}/interviews`),
    orderBy('createdAt', 'desc')
  )

  const listDocs = await getDocs(getData)

  return listDocs.docs.map((doc) => doc.data() as T)
}

const setChartData = () => {
  const data: number[] = [0, 0, 0]

  interviews.value.forEach((interview: IInterview) => {
    if (interview.result === 'Offer') {
      data[0]++
    } else if (interview.result === 'Refusal') {
      data[1]++
    } else {
      data[2]++
    }
  })

  return {
    labels: ['Оффер', 'Отказ', 'В процессе'],
    datasets: [
      {
        data,
        backgroundColor: ['#67C23A', '#F56C6C', '#E6A23C']
      }
    ]
  }
}

const setChartOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false
  }
}
</script>

<template>
  <el-empty v-if="!interviews.length" description="Нет данных" />
  <el-card v-else class="card">
    <template #header>
      <h1 class="title">Статистика</h1>
    </template>
    <Pie :data="chartData" :options="chartOptions" />
  </el-card>
</template>

<style scoped>
.card {
  max-width: 600px;
  margin: 0 auto;
}

.title {
  margin: 0;
}
</style>
