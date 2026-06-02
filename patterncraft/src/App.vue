<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  checkLoginStatus()
  checkPrivacyAgreement()
})

function checkLoginStatus() {
  const token = uni.getStorageSync('token')
  if (!token) {
    console.log('未登录，跳转登录页')
  } else {
    console.log('已登录')
  }
}

function checkPrivacyAgreement() {
  const agreed = uni.getStorageSync('privacyAgreed')
  if (!agreed) {
    console.log('未同意隐私协议')
  }
}
</script>

<style lang="scss">
@import "uni.scss";

/* 全局基础重置 */
page {
  background-color: $bg-primary;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: $font-md;
  color: $text-primary;
  line-height: 1.6;
  --color-primary: #{$primary-color};
  --color-secondary: #{$secondary-color};
  --color-accent: #{$accent-color};
  --color-ink: #{$text-primary};
  --color-paper: #{$bg-primary};
}

/* 通用卡片样式 */
.card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;
}

/* 通用按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  color: #FFFFFF;
  border: none;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(196, 26, 22, 0.3);
}

.btn-primary:active {
  opacity: 0.85;
  transform: scale(0.98);
}

.btn-secondary {
  background: $bg-card;
  color: $primary-color;
  border: 2rpx solid $primary-color;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
}

.btn-text {
  background: transparent;
  color: $primary-color;
  border: none;
  font-size: $font-md;
}

.btn-danger {
  background: transparent;
  color: $error-color;
  border: none;
  font-size: $font-md;
}

/* 安全区域底部 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 分隔线 */
.divider {
  height: 1rpx;
  background: $border-color;
  margin: 0 $spacing-md;
}

/* 徽章 */
.badge-dot {
  width: 16rpx;
  height: 16rpx;
  background: $error-color;
  border-radius: 50%;
  position: absolute;
  top: 0;
  right: 0;
}

/* 文字省略 */
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

/* Flex 工具类 */
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

/* 鸿蒙端特殊适配 */
/* #ifdef APP-HARMONY */
page {
  --status-bar-height: 47px;
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-top {
  padding-top: env(safe-area-inset-top);
}
/* #endif */
</style>
