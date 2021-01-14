const app = getApp()
Page({
  data: {
    list: []
  },
  onLoad() {
    this.getList()
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading()
    this.getList()
  },
  getList() {
    const that = this
    const db = wx.cloud.database()
    db.collection('customer_order').where({
      mobile: wx.getStorageSync('mobile')
    }).get({
      success: function (res) {
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
        console.log(res)
        if (res.errMsg == 'collection.get:ok') {
          that.setData({
            list: res.data
          })
        }
      }
    })
  }
})