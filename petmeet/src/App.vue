<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
  checkLoginStatus()
})

function checkLoginStatus() {
  const token = uni.getStorageSync('token')
  if (!token) {
    console.log('未登录，跳转登录页')
  } else {
    console.log('已登录')
  }
}
</script>

<style lang="scss">
@import "uni.scss";

/* 全局基础重置 */
page {
  background-color: #F8F9FA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 28rpx;
  color: #2D3436;
  line-height: 1.6;
}

/* 通用卡片样式 */
.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

/* 通用按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
  color: #FFFFFF;
  border: none;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
}

.btn-primary:active {
  opacity: 0.85;
  transform: scale(0.98);
}

.btn-secondary {
  background: #FFFFFF;
  color: #FF6B35;
  border: 2rpx solid #FF6B35;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
}

.btn-text {
  background: transparent;
  color: #FF6B35;
  border: none;
  font-size: 28rpx;
}

.btn-danger {
  background: transparent;
  color: #E74C3C;
  border: none;
  font-size: 28rpx;
}

/* 安全区域底部 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 分隔线 */
.divider {
  height: 1rpx;
  background: #F0F0F0;
  margin: 0 24rpx;
}

/* 徽章 */
.badge-dot {
  width: 16rpx;
  height: 16rpx;
  background: #E74C3C;
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
/* #endif */
</style>
