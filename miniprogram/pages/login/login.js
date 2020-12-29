const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobile: "",
    avatar:"",
    name:"",
    sex:''
  },
  //获取手机号码并登录
  getPhoneNumber: function (e) {
    const that = this
    wx.showLoading({
      title: '登录中......',
    })
    wx.cloud.callFunction({
      name: 'getUserNumber',
      data: {
        weRunData: wx.cloud.CloudID(e.detail.cloudID)
      }
    }).then(res => {
      wx.setStorageSync('mobile', res.result.weRunData.data.phoneNumber)
      that.setData({
        mobile:res.result.weRunData.data.phoneNumber
      },() => {
        that.getUserInfo()
      })
      
    })
  },
  getUserInfo(){//获取用户信息
    const that = this
    wx.getUserInfo({
      success(result) {
        console.log(result)
        wx.setStorageSync('avatar', result.userInfo.avatarUrl)
        wx.setStorageSync('name', result.userInfo.nickName)
        that.setData({
          avatar: result.userInfo.avatarUrl,
          name: result.userInfo.nickName,
          sex:result.userInfo.gender,
        },() => {
          that.login()
        })
      }
    })
  },
  login(){//登录
    const that = this
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/login' + app.getPublicKeys() + `&sign=${res.result}`,
        header:{
          "Content-Type":"application/json"
        },
        data: {
          loginId: "18875153039",
          loginType: 0
        },
        method:"POST",
        success(result) {
          wx.hideLoading()
          console.log(result.data)
          if(result.data.code == 0){
            wx.showToast({title: '登录成功'})
          }else if(result.data.code == 2000){
            wx.showModal({
              title:"暂未注册",
              content:"该手机号暂未注册，是否立即注册？",
              success(r){
                if(r.confirm){
                  that.addCustomer()
                }
              }
            })
          }
        }
      })
    })
  },
  //创建顾客
  addCustomer(){
    const that = this
    app.getSign().then(result => {
      wx.request({
        url:app.baseUrl+'/open/v1/crm/createCustomer'+ app.getPublicKeys() + `&sign=${result.result}`,
        header:{
          "Content-Type":"application/json"
        },
        method:"POST",
        data:{
          birthday:Date.parse(new Date()),
          loginId:wx.getStorageSync('mobile'),
          loginType:'0',
          name:that.data.name,
          sex:that.data.sex,
          wxIconUrl:that.data.avatar
        },
        success(res){
            if(res.data.code == 0){
              wx.showModal({
                title:'提示',
                content:"注册成功",
                showCancel:false,
                success(r){
                  if(r.confirm){
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