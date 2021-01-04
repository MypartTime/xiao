const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobile: "",
    avatar: "",
    name: "",
    sex: '',
    active: 1
  },
  //获取手机号码并登录
  getPhoneNumber: function (e) {
    const that = this
    wx.cloud.callFunction({
      name: 'getUserNumber',
      data: {
        weRunData: wx.cloud.CloudID(e.detail.cloudID)
      }
    }).then(res => {
      wx.showLoading({
        title: '登录中......',
      })
      wx.setStorageSync('mobile', res.result.weRunData.data.phoneNumber)
      that.setData({
        mobile: res.result.weRunData.data.phoneNumber
      }, () => {
        // that.login(res.result.weRunData.data.phoneNumber)
        that.login('18875153030')
      })

    })
  },
  getUserInfo(e) { //获取用户信息
    console.log(e.detail)
    wx.setStorageSync('avatar', e.detail.userInfo.avatarUrl)
    wx.setStorageSync('name', e.detail.userInfo.nickName)
    this.setData({
      name:e.detail.userInfo.nickName,
      avatar:e.detail.userInfo.avatarUrl,
      sex:e.detail.userInfo.gender,
      active:2
    })
  },
  login(mobile) { //登录
    const that = this
    app.getSign().then(res => {
      console.log(res)
      wx.request({
        url: app.baseUrl + '/open/v1/crm/login' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        data: {
          loginId: mobile,
          loginType: 0
        },
        method: "POST",
        success(result) {
          wx.hideLoading()
          console.log(result.data)
          if (result.data.code == 0) {
            wx.showToast({
              title: '登录成功'
            })
            wx.setStorageSync('customerId', result.data.result.customerId)
            wx.setStorageSync('customerMainId', result.data.result.customerMainId)
            wx.setStorageSync('memberId', result.data.result.memberId)
          } else if (result.data.code == 2000) {
            that.addCustomer()
          }else{
            wx.showModal({
              title:'提示',
              content:result.data.message,
              showCancel:false
            })
          }
        }
      })
    })
  },
  //创建顾客
  addCustomer() {
    const that = this
    app.getSign().then(result => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/createOrUpgradeMember' + app.getPublicKeys(result.result.timestamp) + `&sign=${result.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        method: "POST",
        data: {
          attentionWxTime: Date.parse(new Date()),
          birthday: Date.parse(new Date()),
          consumePwd:"123456",
          customerId:"0",
          customerMainId:"0",
          // loginId: wx.getStorageSync('mobile'),
          loginId: '18875153030',
          loginType: '0',
          name: that.data.name,
          sex: that.data.sex,
          wxIconUrl: that.data.avatar
        },
        success(res) {
          console.log(res)
          if (res.data.code == 0) {
            wx.setStorageSync('customerId', res.data.result.customerId)
            wx.showModal({
              title: '提示',
              content: "注册成功",
              showCancel: false,
              success(r) {
                if (r.confirm) {
                  wx.navigateBack({
                    delta: -1,
                  })
                }
              }
            })
          }
        }
      })
    })
  },
  onLoad() {


  },
})