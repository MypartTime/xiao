const app = getApp()
var md5 = require('md5');

Page({
  data: {
    userInfo: {},
  },
  onLoad() {
    this.getUserInfo()
  },
  getUserInfo() {
    const that = this
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/getCustomerDetailById' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        data: {
          customerId: wx.getStorageSync('customerId')
        },
        method: "POST",
        success(result) {
          if (result.data.code == 0) {
            that.setData({
              userInfo: result.data.result,
            })
          }
        }
      })
    })
  },
  handlepwd(e) {
    let {
      old,
      newpwd,
      renewpwd
    } = e.detail.value
    console.log(old, newpwd, renewpwd)
    if (!old) {
      wx.showModal({
        title: '提示',
        content: '请输入旧密码',
        showCancel: false,
      })
    } else if (old != this.data.userInfo.memo) {
      wx.showModal({
        title: '提示',
        content: '旧密码错误，请重试',
        showCancel: false,
      })
    } else if (!(/^\d{6}$/g.test(newpwd) && /^\d{6}$/g.test(renewpwd))) {
      wx.showModal({
        title: '提示',
        content: '格式错误，支付密码只能是6位数的数字',
        showCancel: false,
      })
    } else if (newpwd != renewpwd) {
      wx.showModal({
        title: '提示',
        content: '两次输入不一致，请重新输入',
        showCancel: false,
      })
    } else {
      const {birthday,customerName,sex} = this.data.userInfo
      app.getSign().then(result => {
        wx.request({
          url: app.baseUrl + '/open/v1/crm/updateCustomerInfo' + app.getPublicKeys(result.result.timestamp) + `&sign=${result.result.sign}`,
          header: {
            "Content-Type": "application/json"
          },
          method: "POST",
          data: {
            birthday:new Date(birthday).getTime(),name:customerName,sex,
            consumePwd:md5(newpwd),
            memo:newpwd,
            customerId:wx.getStorageSync('customerId')
          },
          success(result) {
            if(result.data.code == 0){
              wx.showModal({
                title:'提示',
                content:'修改成功',
                showCancel:false,
                success(){
                  wx.navigateBack({
                    delta: 1,
                  })
                }
              })
            }
          }
        })
      })
    }
  }
})