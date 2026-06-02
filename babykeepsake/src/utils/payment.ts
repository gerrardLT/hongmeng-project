/**
 * 发起支付请求
 * @param params 支付参数
 * @returns Promise<boolean> 是否支付成功
 */
export function requestPayment(params: Record<string, any>): Promise<boolean> {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (uni.requestPayment as any)({
      ...params,
      success: () => resolve(true),
      fail: (err: any) => {
        console.error('requestPayment error:', err)
        resolve(false)
      }
    })
  })
}

/**
 * 格式化金额（分转元）
 * @param amount 金额（单位：分）
 * @returns 格式化后的金额字符串，如 128.00
 */
export function formatAmount(amount: number): string {
  return (amount / 100).toFixed(2)
}
