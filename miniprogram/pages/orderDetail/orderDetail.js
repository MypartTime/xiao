const app = getApp()
Page({

  data: {
    id: "28ee4e3e601c071702eeaaf47df373ec",
    orderInfo: {},
    orderState: {},
    totalNum: 0,
  },
  onLoad: function (options) {
    this.getOrderInfo()
  },
  getInfo(id) {
    const that = this
    app.getSign().then(result => {
      wx.request({
        url: app.baseUrl + '/open/v1/takeout/order/status/get' + app.getPublicKeys(result.result.timestamp) + `&sign=${result.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        method: "POST",
        data: {
          orderId: id
        },
        success(res) {
          app.hideLoading()
          if (res.data.code == 0) {
            that.setData({
              orderState: res.data.result
            })
          }
        }
      })
    })
  },
  getOrderInfo() {
    const that = this
    app.showLoading('加载中')
    const db = wx.cloud.database()
    db.collection('customer_order').doc(this.data.id).get({
      success: function (res) {
        let obj = res.data
        obj.dishes = JSON.parse(obj.dishes)
        let totalNum = 0
        obj.dishes.forEach(el => {
          totalNum += parseInt(el.totalNum)
        });
        that.setData({
          orderInfo: obj,
          totalNum
        }, () => {
          that.getInfo(res.data.orderId)
        })
      }
    })
  },
  handleCall() {
    wx.makePhoneCall({
      phoneNumber: '15998908949' 
    })
  }
})