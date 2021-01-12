const app = getApp()
Page({
  data: {
    list:[]
  },
  onLoad(){
    const that = this
    const db = wx.cloud.database()
    db.collection('customer_order').where({
      mobile:wx.getStorageSync('mobile')
    }).get({
      success: function(res) {
        console.log(res)
        if(res.errMsg == 'collection.get:ok'){
          that.setData({
            list: res.data
          })
        }
      }
    })
  }
})