const app = getApp()
// import { evaluate } from "eval5";
import {evaluate} from 'eval5'
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
        that.login(res.result.weRunData.data.phoneNumber)
      })

    })
  },
  getUserInfo(e) { //获取用户信息
    console.log(e.detail)
    wx.setStorageSync('avatar', e.detail.userInfo.avatarUrl)
    wx.setStorageSync('name', e.detail.userInfo.nickName)
    this.setData({
      name: e.detail.userInfo.nickName,
      avatar: e.detail.userInfo.avatarUrl,
      sex: e.detail.userInfo.gender,
      active: 2
    })
  },
  login(mobile) { //登录
    const that = this
    app.getSign().then(res => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/login' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        data: {
          loginId: mobile,
          loginType: 0
        },
        dataType: 'text',
        method: "POST",
        success(result) {
          wx.hideLoading()

          let data = that.getRealJsonData(result.data)
          console.log(data)
          if (data.code == 0) {
            wx.showToast({
              title: '登录成功'
            })
            wx.setStorageSync('customerId', data.result.customerId)
            wx.setStorageSync('customerMainId', data.result.customerMainId)
            wx.setStorageSync('memberId', data.result.memberId)
          } else if (data.code == 2000) {
            that.addCustomer()
          } else {
            wx.showModal({
              title: '提示',
              content: result.data.message,
              showCancel: false
            })
          }
        }
      })
    })
  },

  getRealJsonData(baseStr) {
    if (!baseStr || typeof baseStr != 'string') return;
    var jsonData = null;
    try {
      jsonData = JSON.parse(baseStr);
    } catch (err) {
      return null;
    }
    var needReplaceStrs = [];
    this.loopFindArrOrObj(jsonData, needReplaceStrs);
    needReplaceStrs.forEach(function (replaceInfo) {
      var matchArr = baseStr.match(evaluate('/"' + replaceInfo.key + '":[0-9]{15,}/'));
      if (matchArr) {
        var str = matchArr[0];
        var replaceStr = str.replace('"' + replaceInfo.key + '":', '"' + replaceInfo.key + '":"');
        replaceStr += '"';
        baseStr = baseStr.replace(str, replaceStr);
      }
    });
    var returnJson = null;
    try {
      returnJson = JSON.parse(baseStr);
    } catch (err) {
      return null;
    }
    return returnJson;
  },
  getNeedRpStrByObj(obj, needReplaceStrs) {
    for (var key in obj) {
      var value = obj[key];
      // 大于这个数说明精度会丢失!
      if (typeof value == 'number' && value > 9007199254740992) {
        needReplaceStrs.push({
          key: key
        });
      }
      this.loopFindArrOrObj(value, needReplaceStrs);
    }
  },

  getNeedRpStrByArr(arr, needReplaceStrs) {
    for (var i = 0; i < arr.length; i++) {
      var value = arr[i];
      this.loopFindArrOrObj(value, needReplaceStrs);
    }
  },

  loopFindArrOrObj(value, needRpStrArr) {
    var valueTypeof = Object.prototype.toString.call(value);
    if (valueTypeof == '[object Object]') {
      needRpStrArr.concat(this.getNeedRpStrByObj(value, needRpStrArr));
    }
    if (valueTypeof == '[object Array]') {
      needRpStrArr.concat(this.getNeedRpStrByArr(value, needRpStrArr));
    }
  },
  //创建顾客
  addCustomer() {
    const that = this
    app.getSign().then(result => {
      wx.request({
        url: app.baseUrl + '/open/v1/crm/createCustomer' + app.getPublicKeys(result.result.timestamp) + `&sign=${result.result.sign}`,
        header: {
          "Content-Type": "application/json"
        },
        method: "POST",
        data: {
          attentionWxTime: Date.parse(new Date()),
          birthday: Date.parse(new Date()),
          loginId: wx.getStorageSync('mobile'),
          loginType: '0',
          name: that.data.name,
          sex: that.data.sex,
          wxIconUrl: that.data.avatar
        },
        success(res) {
          let data = that.getRealJsonData(res.data)
          if (data.code == 0) {
            wx.setStorageSync('customerId', data.result.customerId)
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