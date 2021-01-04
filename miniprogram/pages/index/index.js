//index.js
const app = getApp()

Page({
  data: {

  },
  onLoad(){
    this.getDishList()
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
  },
  getDishList(){
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/cater/dish/dishMenu' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        method:"POST",
        data:{
          shopIdenty:"810983262",
          pageNum:"10"
        },
        success(result){
          console.log(result)
        }
      })
    })
  }
})