// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const res = await cloud.cloudPay.unifiedOrder({
    functionName:"getPaymentInfo", //结果通知回调云函数名
    envId:"xiao", //结果通知回调云函数环境
    subMchId:"1482354182", //子商户号
    nonceStr:"ibuaiVcKdpRxkhJA",//随机字符串
    body:event.body,//商品描述
    outTradeNo:event.outTradeNo,//商户订单号
    totalFee:event.totalFee,//总金额
    spbillCreateIp:"127.0.0.1",//终端IP
    tradeType:"JSAPI",//交易类型
  })
  return res
}