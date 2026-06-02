<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useChecklistsStore } from '@/store/checklists'
import { useGearStore } from '@/store/gear'
import { useTemplatesStore } from '@/store/templates'

onLaunch(() => {
  console.log('CampReady App Launch')

  const userStore = useUserStore()
  const checklistsStore = useChecklistsStore()
  const gearStore = useGearStore()
  const templatesStore = useTemplatesStore()

  userStore.init()
  checklistsStore.init()
  gearStore.init()
  templatesStore.init()

  if (!userStore.isPrivacyAgreed) {
    console.log('隐私协议未同意，跳过 SDK 初始化')
    return
  }

  if (!userStore.isLoggedIn) {
    console.log('未登录')
  } else {
    console.log('已登录:', userStore.userInfo?.nickname)
  }
})
</script>

<style lang="scss">
@import "uni.scss";

page {
  background-color: #F5F5F5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 28rpx;
  color: #212121;
  line-height: 1.6;
}

.card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.btn-primary {
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  color: #FFFFFF;
  border: none;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(46, 125, 50, 0.3);
}

.btn-primary:active {
  opacity: 0.85;
  transform: scale(0.98);
}

.btn-secondary {
  background: #FFFFFF;
  color: #2E7D32;
  border: 2rpx solid #2E7D32;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
}

.btn-text {
  background: transparent;
  color: #2E7D32;
  border: none;
  font-size: 28rpx;
}

.btn-danger {
  background: transparent;
  color: #E74C3C;
  border: none;
  font-size: 28rpx;
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.divider {
  height: 1rpx;
  background: #F0F0F0;
  margin: 0 24rpx;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-1 {
  flex: 1;
}

/* #ifdef APP-HARMONY */
page {
  --status-bar-height: 47px;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}
/* #endif */
</style>
