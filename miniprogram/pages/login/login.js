const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobile: ""
  },
  getPhoneNumber: function (e) {
    wx.cloud.callFunction({
      name: 'getUserNumber',
      data: {
        weRunData: wx.cloud.CloudID(e.detail.cloudID)
      }
    }).then(res => {
      wx.setStorageSync('mobile', res.result.weRunData.data.phoneNumber)
      wx.getUserInfo({
        success(result) {
          console.log(result)
          wx.setStorageSync('avatar', result.userInfo.avatarUrl)
          wx.setStorageSync('name', result.userInfo.nickName)
        }
      })
      this.setData({
        mobile: res.result.weRunData.data.phoneNumber
      })

    })
  },
  onLoad() {

    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/login' + app.getPublicKeys() + `&sign=8346e2f5ec8b923d006e293e2b77de294076c6c134dad53c92da557cd51079f7`,
        data: {
          loginId: "18875153039",
          loginType: 0
        },
        method:"POST",
        success(res) {
          console.log(res.data.message)
        }
      })
    })
  },
})