<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info" @click="handleLogin">
        <image
          class="user-avatar"
          :src="userStore.userInfo?.avatar || '/static/images/default-avatar.png'"
        />
        <view class="user-meta">
          <text class="user-name">{{ userStore.isLoggedIn ? userStore.userInfo?.nickname : '点击登录' }}</text>
          <text class="user-id" v-if="userStore.isLoggedIn">ID: {{ userStore.userInfo?.userId }}</text>
        </view>
        <text v-if="userStore.isLoggedIn" class="user-arrow">›</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-card">
      <view class="menu-item" @click="goSettings">
        <text class="menu-icon">👁️</text>
        <view class="menu-content">
          <text class="menu-title">我的色觉类型</text>
          <text class="menu-value">{{ colorBlindText }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />
      <view class="menu-item" @click="goSettings">
        <text class="menu-icon">🎨</text>
        <view class="menu-content">
          <text class="menu-title">滤镜设置</text>
          <text class="menu-value">{{ filterText }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />
      <view class="menu-item" @click="goHistory">
        <text class="menu-icon">📜</text>
        <view class="menu-content">
          <text class="menu-title">历史记录</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />
      <view class="menu-item" @click="goRetest">
        <text class="menu-icon">🧪</text>
        <view class="menu-content">
          <text class="menu-title">重新检测</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 关于区域 -->
    <view class="menu-card">
      <view class="menu-item" @click="showAbout">
        <text class="menu-icon">ℹ️</text>
        <view class="menu-content">
          <text class="menu-title">关于 ColorAid</text>
          <text class="menu-value">v1.0.0</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />
      <view class="menu-item" @click="showDisclaimer">
        <text class="menu-icon">⚠️</text>
        <view class="menu-content">
          <text class="menu-title">免责声明</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />
      <view class="menu-item" @click="openPrivacyPolicy">
        <text class="menu-icon">🔒</text>
        <view class="menu-content">
          <text class="menu-title">隐私政策</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />
      <view class="menu-item" @click="openUserAgreement">
        <text class="menu-icon">📋</text>
        <view class="menu-content">
          <text class="menu-title">用户协议</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <button
      v-if="userStore.isLoggedIn"
      class="logout-btn"
      @click="handleLogout"
    >
      退出登录
    </button>

    <!-- 免责声明弹窗 -->
    <Dialog
      :visible="disclaimerVisible"
      title="免责声明"
      confirm-text="我知道了"
      :show-cancel="false"
      @update:visible="disclaimerVisible = $event"
    >
      <view class="disclaimer-content">
        <view class="disclaimer-item">
          <text class="disclaimer-num">1</text>
          <text class="disclaimer-text"><text class="disclaimer-bold">非医疗器械声明：</text>本应用为色彩辅助工具软件，不属于医疗器械范畴，未经过任何医疗器械认证或审批，不具备医学诊断、治疗或康复功能。</text>
        </view>
        <view class="disclaimer-item">
          <text class="disclaimer-num">2</text>
          <text class="disclaimer-text"><text class="disclaimer-bold">检测不构成诊断：</text>本应用提供的色觉检测仅为初步筛查工具，检测结果受设备性能、屏幕校准、环境光线等多种因素影响，不能替代专业医疗机构的正规检查与诊断。</text>
        </view>
        <view class="disclaimer-item">
          <text class="disclaimer-num">3</text>
          <text class="disclaimer-text"><text class="disclaimer-bold">滤镜不能治愈：</text>本应用提供的实时滤镜、色彩增强等功能仅为辅助识别工具，不能治愈、纠正或改善色觉异常，也不具备任何治疗或康复效果。</text>
        </view>
        <view class="disclaimer-item">
          <text class="disclaimer-num">4</text>
          <text class="disclaimer-text"><text class="disclaimer-bold">不提供医学建议：</text>本应用及其开发者不提供任何医学建议、诊断意见或治疗方案。如有视力健康相关问题，请务必及时咨询专业眼科医生或正规医疗机构。</text>
        </view>
        <view class="disclaimer-item">
          <text class="disclaimer-num">5</text>
          <text class="disclaimer-text"><text class="disclaimer-bold">使用风险自担：</text>因使用或依赖本应用而产生的任何直接或间接损失、损害或风险，均由用户自行承担。在涉及健康、安全等关键场景中，请勿仅依赖本应用的输出结果。</text>
        </view>
      </view>
    </Dialog>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useSettingsStore } from '@/store/settings'
import Dialog from '@/components/common/Dialog.vue'

const userStore = useUserStore()
const settingsStore = useSettingsStore()

const disclaimerVisible = ref(false)

const colorBlindText = computed(() => {
  const map: Record<string, string> = {
    normal: '正常',
    protanopia: '红色盲',
    deuteranopia: '绿色盲',
    tritanopia: '蓝色盲',
    achromatopsia: '全色盲'
  }
  return map[settingsStore.colorBlindType] || '未设置'
})

const filterText = computed(() => {
  const mode = settingsStore.filterMode
  if (!mode) return '未开启'
  const map: Record<string, string> = {
    protanopia: '红',
    deuteranopia: '绿',
    tritanopia: '蓝',
    achromatopsia: '全色'
  }
  return `${map[mode]}色滤镜 · 强度${settingsStore.filterStrength}`
})

function handleLogin() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
}

function goSettings() {
  uni.navigateTo({ url: '/pages/profile/settings' })
}

function goHistory() {
  uni.navigateTo({ url: '/pages/history/index' })
}

function goRetest() {
  uni.navigateTo({ url: '/pages/test/index' })
}

function showAbout() {
  uni.showModal({
    title: '关于 ColorAid',
    content: 'ColorAid v1.0.0\n色盲色弱辅助工具\n\n让色彩不再成为障碍',
    showCancel: false
  })
}

function showDisclaimer() {
  disclaimerVisible.value = true
}

function openPrivacyPolicy() {
  uni.navigateTo({
    url: '/pages/webview/index?url=' + encodeURIComponent('/static/legal/privacy-policy.html')
  })
}

function openUserAgreement() {
  uni.navigateTo({
    url: '/pages/webview/index?url=' + encodeURIComponent('/static/legal/user-agreement.html')
  })
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding: $spacing-md;
}

.user-card {
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  border-radius: $radius-lg;
  padding: $spacing-xl;
  margin-bottom: $spacing-lg;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.2);
}

.user-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.user-name {
  font-size: $font-xl;
  font-weight: 600;
  color: #FFFFFF;
}

.user-id {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.8);
}

.user-arrow {
  font-size: $font-xl;
  color: rgba(255, 255, 255, 0.6);
}

.menu-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  margin-bottom: $spacing-lg;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  gap: $spacing-md;

  &:active {
    background-color: $bg-color;
  }
}

.menu-icon {
  font-size: 40rpx;
  width: 48rpx;
  text-align: center;
}

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.menu-title {
  font-size: $font-md;
  color: $text-primary;
}

.menu-value {
  font-size: $font-sm;
  color: $text-secondary;
}

.menu-arrow {
  font-size: $font-lg;
  color: $text-hint;
}

.menu-divider {
  height: 1rpx;
  background-color: $border-color;
  margin-left: 88rpx;
}

.logout-btn {
  margin-top: $spacing-xl;
  background-color: $bg-card;
  color: $error-color;
  border: none;
  border-radius: $radius-lg;
  height: 96rpx;
  line-height: 96rpx;
  font-size: $font-md;

  &::after {
    border: none;
  }
}

.dialog-text {
  font-size: $font-md;
  color: $text-secondary;
  line-height: 1.6;
  display: block;
  padding: $spacing-md 0;
  text-align: center;
}

.disclaimer-content {
  max-height: 600rpx;
  overflow-y: auto;
  padding: $spacing-sm 0;
}

.disclaimer-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.disclaimer-num {
  width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  background: #cf1322;
  color: #fff;
  border-radius: 50%;
  font-size: 22rpx;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.disclaimer-text {
  flex: 1;
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.6;
}

.disclaimer-bold {
  font-weight: 600;
  color: $text-primary;
}
</style>
