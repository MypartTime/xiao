//index.js
const app = getApp()

Page({
  data: {

  },
  handlePayment() {
    let data = {
      body: "test",
      outTradeNo: 'XIAO' + Date.parse(new Date()) / 1000 + parseInt((Math.random() * 9) + 1),
      totalFee: 1
    }
    wx.cloud.callFunction({
      name: 'payment',
      data
    }).then(res => {
      const payment = res.result.payment
      wx.requestPayment({
        ...payment,
        success(res) {
          console.log('pay success', res)
        },
        fail(res) {
          console.error('pay fail', res)
        }
      })
    })
  }
})