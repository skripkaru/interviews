import { ElLoading } from 'element-plus'

export const useLoading = (options = {}) => {
  const defaultOptions = {
    fullscreen: true,
    lock: true,
    ...options
  }

  let loadingInstance: any = null

  const startLoading = () => {
    loadingInstance = ElLoading.service(defaultOptions)
  }

  const stopLoading = () => {
    if (loadingInstance) {
      loadingInstance.close()
    }
  }

  return {
    startLoading,
    stopLoading
  }
}
