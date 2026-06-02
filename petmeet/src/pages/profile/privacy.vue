<template>
  <view class="privacy-page">
    <NavBar title="隐私政策" />
    <scroll-view class="content" scroll-y>
      <view class="section">
        <text class="section-title">隐私政策</text>
        <text class="update-time">更新时间：2026年4月21日</text>
        <text class="paragraph">
          PetMeet（以下简称"我们"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全。我们致力于维持您对我们的信任，恪守以下原则保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。同时，我们承诺，我们将按业界成熟的安全标准，采取相应的安全保护措施来保护您的个人信息。
        </text>
      </view>

      <view class="section">
        <text class="section-title">一、信息收集说明</text>
        <text class="paragraph">
          为了向您提供服务，我们可能会收集以下类型的信息：
        </text>
        <text class="paragraph">
          1. 账号信息：当您注册账号时，我们会收集您的手机号或华为账号信息，用于创建您的用户身份标识。
        </text>
        <text class="paragraph">
          2. 宠物信息：您可以自愿添加宠物的名称、品种、年龄、照片等信息，用于展示和社交功能。
        </text>
        <text class="paragraph">
          3. 日记内容：您发布的文字、图片等内容将被存储以提供社交分享服务。
        </text>
        <text class="paragraph">
          4. 设备信息：我们会收集设备型号、操作系统版本等信息，以优化应用性能。
        </text>
      </view>

      <view class="section">
        <text class="section-title">二、NFC权限用途</text>
        <text class="paragraph">
          在鸿蒙设备上，我们需要申请NFC权限以实现"碰一碰加好友"功能。当您与其他宠友的设备近距离触碰时，NFC功能可以帮助快速交换宠物名片信息。NFC权限仅在您主动使用该功能时启用，我们不会通过NFC收集您的位置或其他敏感信息。
        </text>
      </view>

      <view class="section">
        <text class="section-title">三、位置权限用途</text>
        <text class="paragraph">
          我们需要位置权限来记录您与宠友相遇的地点信息，以及为您推荐附近的宠物活动和宠友。位置信息仅在您主动记录相遇地点或发布带位置信息的日记时收集，您可以在设置中随时关闭位置权限。
        </text>
      </view>

      <view class="section">
        <text class="section-title">四、相册/相机权限用途</text>
        <text class="paragraph">
          我们需要相册和相机权限，以便您上传宠物照片、发布日记图片。这些权限仅在您主动选择上传图片时触发，我们不会自动扫描您的相册。
        </text>
      </view>

      <view class="section">
        <text class="section-title">五、数据存储说明</text>
        <text class="paragraph">
          您的个人数据存储在安全的云服务器上，并采用加密技术进行保护。本地缓存数据存储在您的设备中，您可以通过清除应用数据来删除本地存储。我们承诺不会将您的个人信息出售或分享给第三方，除非获得您的明确同意或法律法规要求。
        </text>
      </view>

      <view class="section">
        <text class="section-title">六、账号注销说明</text>
        <text class="paragraph">
          您有权随时注销您的账号。账号注销后，我们将删除您的个人信息，但法律法规要求保留的信息除外。注销账号将导致您无法继续使用我们的服务，您的宠物信息、日记、宠友关系等数据将被清除且无法恢复。如需注销账号，请前往"我的-设置-账号注销"进行操作。
        </text>
      </view>

      <view class="section">
        <text class="section-title">七、联系我们</text>
        <text class="paragraph">
          如您对本隐私政策有任何疑问，请联系我们的客服团队。我们将尽快回复您的咨询。
        </text>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-spacing"></view>
    </scroll-view>

    <!-- 从登录页进入时显示同意按钮 -->
    <view v-if="showAgreeBtn" class="agree-bar">
      <button class="agree-btn" @click="onAgree">我已阅读并同意</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/common/NavBar.vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const showAgreeBtn = ref(false)

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const from = currentPage?.$route?.query?.from || currentPage?.options?.from
  if (from === 'login') {
    showAgreeBtn.value = true
  }
})

function onAgree() {
  userStore.agreePrivacy()
  uni.showToast({ title: '已同意隐私政策', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1000)
}
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 24rpx 32rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
  display: block;
  margin-bottom: 16rpx;
}

.update-time {
  font-size: 24rpx;
  color: #B2BEC3;
  display: block;
  margin-bottom: 24rpx;
}

.paragraph {
  font-size: 28rpx;
  color: #636E72;
  line-height: 1.8;
  display: block;
  margin-bottom: 12rpx;
  text-align: justify;
}

.bottom-spacing {
  height: 120rpx;
}

.agree-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 40rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #FFFFFF;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
}

.agree-btn {
  width: 90%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8F5A);
  color: #FFFFFF;
  font-size: 32rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.agree-btn::after {
  border: none;
}
</style>
