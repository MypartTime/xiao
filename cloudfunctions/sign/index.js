// 云函数入口文件
const cloud = require('wx-server-sdk')
var sha256 = require('js-sha256');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let sign = sha256(`appKey${event.appKey}shopIdenty${event.shopIdenty}timestamp${Math.floor(Date.parse(new Date())/10000)*10000}version${event.version}${event.token}`)
  return sign
}