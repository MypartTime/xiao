const app = getApp()
    // import { evaluate } from "eval5";
import { evaluate } from 'eval5'
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
    getuserInfo() {
        const that = this
        wx.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                console.log(res);
                this.setData({
                    name: res.userInfo.nickName,
                    avatar: res.userInfo.avatarUrl,
                    sex: res.userInfo.gender,
                    active: 2
                })
            }
        })
    },
    //获取手机号码并登录
    getPhoneNumber: function(e) {
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
                dataType: 'text',
                method: "POST",
                data: {
                    loginId: mobile,
                    loginType: 0
                },
                success(result) {
                    wx.hideLoading()
                    let data = app.getRealJsonData(result.data)
                        // console.log(data)
                    if (data.code == 0) {
                        that.addCustomer()
                        wx.showToast({
                            title: '登录成功'
                        })
                        wx.setStorageSync('customerId', data.result.customerId)
                        setTimeout(() => {
                            wx.navigateBack({
                                delta: 1,
                            })
                        }, 800);
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
    //创建顾客
    addCustomer() {
        const that = this
        app.getSign().then(result => {
            wx.request({
                url: app.baseUrl + '/open/v1/crm/createCustomer' + app.getPublicKeys(result.result.timestamp) + `&sign=${result.result.sign}`,
                header: {
                    "Content-Type": "application/json"
                },
                dataType: 'text',
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
                    console.log(res)
                    let data = app.getRealJsonData(res.data)
                    console.log(data)
                    if (data.code == 0) {
                        wx.setStorageSync('customerId', data.result.customerId)
                        wx.showModal({
                            title: '提示',
                            content: "注册成功",
                            showCancel: false,
                            success(r) {
                                if (r.confirm) {
                                    wx.navigateBack({
                                        delta: 1,
                                    })
                                }
                            }
                        })
                    }
                }
            })
        })
    },
    handleCancel() {
        wx.navigateBack({
            delta: 1,
        })
    },
    onLoad() {


    },
})