<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

onLaunch(() => {
  console.log('SealCraft App Launch')
  initApp()
})

onShow(() => {
  console.log('SealCraft App Show')
})

function initApp() {
  const userStore = useUserStore()
  userStore.init()

  // 检查隐私协议状态
  if (!userStore.isPrivacyAgreed) {
    console.log('隐私政策未同意，等待用户操作')
  } else {
    console.log('隐私政策已同意，初始化服务')
    initServices()
  }
}

function initServices() {
  // 隐私协议同意后才初始化SDK和服务
  // #ifdef APP-HARMONY
  console.log('初始化鸿蒙服务')
  // #endif
}
</script>

<style lang="scss">
@import "uni.scss";

/* 全局重置 */
page {
  background-color: $bg-page;
  font-size: 28rpx;
  color: $text-primary;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* ===== 通用卡片 ===== */
.card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

/* ===== 按钮样式 ===== */
.btn-primary {
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  color: #FFFFFF;
  text-align: center;
  border: none;
}

.btn-primary:active {
  opacity: 0.85;
}

.btn-secondary {
  background: $bg-card;
  border: 2rpx solid $primary;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
  color: $primary;
  text-align: center;
}

.btn-text {
  background: transparent;
  color: $primary;
  font-size: 28rpx;
  border: none;
  padding: 0;
}

/* ===== Flex 工具类 ===== */
.flex-row { display: flex; flex-direction: row; align-items: center; }
.flex-col { display: flex; flex-direction: column; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-wrap { display: flex; flex-wrap: wrap; }
.flex-1 { flex: 1; }

/* ===== 文字省略 ===== */
.text-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-ellipsis-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ===== 间距工具类 ===== */
.mt-xs { margin-top: $spacing-xs; }
.mt-sm { margin-top: $spacing-sm; }
.mt-md { margin-top: $spacing-md; }
.mt-lg { margin-top: $spacing-lg; }
.mb-xs { margin-bottom: $spacing-xs; }
.mb-sm { margin-bottom: $spacing-sm; }
.mb-md { margin-bottom: $spacing-md; }
.mb-lg { margin-bottom: $spacing-lg; }
.px-md { padding-left: $spacing-md; padding-right: $spacing-md; }
.py-md { padding-top: $spacing-md; padding-bottom: $spacing-md; }

/* ===== 安全区域 ===== */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* ===== 鸿蒙适配 ===== */
/* #ifdef APP-HARMONY */
page {
  --status-bar-height: 47px;
}
/* #endif */

/* ===== 分割线 ===== */
.divider {
  height: 1rpx;
  background: #EEEEEE;
  margin: $spacing-md 0;
}

/* ===== 标签样式 ===== */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.tag-primary {
  background: rgba(196, 26, 26, 0.1);
  color: $primary;
}

.tag-accent {
  background: rgba(84, 139, 84, 0.1);
  color: $accent;
}
</style>
