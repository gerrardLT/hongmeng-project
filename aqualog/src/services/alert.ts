/**
 * AquaLog 预警服务
 * 封装预警检查、建议生成、预警消除
 */
import type { AlertItem } from '@/types/models'
import { useAlertStore } from '@/store/alert'

/**
 * 检查并更新指定水族箱的预警
 */
export function checkAndUpdateAlerts(aquariumId: string): void {
  const alertStore = useAlertStore()
  alertStore.checkAlerts(aquariumId)
}

/**
 * 根据预警类型返回处理建议
 */
export function getAlertSuggestion(alert: AlertItem): string {
  switch (alert.type) {
    case 'paramOutOfRange':
      if (alert.paramName === 'ammonia' || alert.paramName === 'nitrite') {
        return '氨氮/亚硝酸盐超标通常说明硝化系统不完善。建议：1) 立即换水30%；2) 检查过滤系统是否正常运行；3) 减少喂食量；4) 考虑添加硝化细菌。'
      }
      if (alert.paramName === 'ph') {
        return 'pH值异常可能影响鱼类健康。建议：1) 避免大幅度调整，每次调整不超过0.2；2) 检查底砂和装饰物是否影响pH；3) 使用专业pH调节剂。'
      }
      if (alert.paramName === 'temperature') {
        return '温度异常可能导致鱼类应激。建议：1) 检查加热棒是否正常工作；2) 避免阳光直射；3) 夏天可使用散热风扇。'
      }
      if (alert.paramName === 'nitrate') {
        return '硝酸盐偏高说明需要换水。建议：1) 进行25%-30%换水；2) 增加水草数量吸收硝酸盐；3) 定期清理底砂。'
      }
      return alert.suggestion || '请根据参数情况采取相应措施'

    case 'maintenanceDue':
      return '定期换水是维护水质的关键。建议：1) 换水量控制在25%-30%；2) 新水需提前除氯并调温；3) 换水同时可清洗过滤棉（用原缸水清洗）。'

    case 'noRecordDays':
      return '定期记录水质参数有助于：1) 及时发现水质问题；2) 建立水族箱数据档案；3) 分析长期趋势。建议每天固定时间测量记录。'

    default:
      return alert.suggestion || '请关注水族箱状态'
  }
}

/**
 * 消除预警
 */
export function dismissAlert(alertId: string): void {
  const alertStore = useAlertStore()
  alertStore.dismissAlert(alertId)
}

/**
 * 获取所有活跃预警
 */
export function getActiveAlerts(): AlertItem[] {
  const alertStore = useAlertStore()
  return alertStore.alerts.filter((a) => !a.dismissed)
}
