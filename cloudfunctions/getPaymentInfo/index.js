// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log('payment callback!', event, context)
  const orderId = event.outTradeNo
  const openid = event.userInfo.openId
  const returnCode = event.returnCode
  const cashFee = event.cashFee
  if (returnCode == 'SUCCESS') {
    //更新云数据库数据
    const res = {
      errcode: 0,
      errmsg: '支付成功',
      orderId,
      openid,
      cashFee
    } //需要返回的字段，不返回该字段则一直回调
    return res
  } else {
    return {
      errcode: 500,
      errmsg: '回调失败',
      orderId,
      openid,
      cashFee
    }
  }

}