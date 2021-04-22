const app = getApp()
var md5 = require('md5');
Page({
    data: {
        userInfo: {},
        account: '', //输入的价格
        level: '',
        show: false, //页面展示
        showLog: false, //登录显示
        showPwd: false, //密码框展示
        showMethods: false, //弹出支付方式
        tapClose: true,
        isFocus: false
    },
    onShow() {
        if (wx.getStorageSync('mobile') && wx.getStorageSync('customerId')) {
            this.getUserInfo()
            this.setData({
                showLog: false
            })
        } else {
            this.setData({
                showLog: true
            })
        }
    },
    onPullDownRefresh() {
        wx.showNavigationBarLoading()
        this.getUserInfo()
    },
    //控制输入金额
    handleInput(e) {
        //总价
        let account = ((e.detail.value) * 1).toFixed(2)
        console.log(account)
        this.setData({
            account,
        })
    },
    //关闭支付
    handlePwd() {
        this.setData({
            showPwd: false
        })
    },
    //点击支付
    handlePay() {
        console.log(this.data.account * 1 == NaN)
        if (this.data.account * 1 != 0 && !isNaN(this.data.account * 1) && typeof(this.data.account * 1) == 'number') {
            this.setData({
                showMethods: true
            })
        } else if (isNaN(this.data.account * 1)) {
            app.showToast('请正确输入买单金额', 'error')
        } else {
            app.showToast('请输入买单金额', 'error')
        }
    },
    choosePayment(e) {
        let i = e.currentTarget.dataset.i
        if (i == 1 && this.data.vipAccount >= this.data.account) {
            this.setData({
                showPwd: true,
                isFocus: true
            })
        } else if (i == 1 && this.data.vipAccount < this.data.account) {
            wx.showModal({
                title: '提示',
                content: '余额不足，请先充值',
                confirmText: '充值',
                success(c) {
                    if (c.confirm) {
                        app.navigator('/pages/recharge/recharge')
                    }
                }
            })
        } else if (i == 2) {
            this.handlePayment()
            console.log('微信支付')
        }
        this.setData({
            showMethods: false
        })
    },
    inputPwd(e) {
        let pwd = e.detail.value
        console.log(pwd)
        if (pwd.length == 6 && pwd != this.data.userInfo.memo) {
            app.showToast('密码错误,请重试', 'none')
        } else if (pwd.length == 6 && pwd == this.data.userInfo.memo) {
            console.log('支付成功')
            console.log('调用接口扣除储值金额及生成订单')
            app.showLoading('支付中')
            this.setData({
                showPwd: false
            })
            this.handleGoodsOrder(1)
        }
    },
    //唤起支付
    handlePayment() {
        const that = this
        if (that.data.account) {
            let data = {
                body: "小程序支付" + that.data.account + '元',
                outTradeNo: 'XIAO' + Date.parse(new Date()) / 1000 + parseInt((Math.random() * 9) + 1),
                totalFee: that.data.account * 100
            }
            wx.cloud.callFunction({
                name: 'payment',
                data
            }).then(res => {
                const payment = res.result.payment
                wx.requestPayment({
                    ...payment,
                    success() {
                        that.handleGoodsOrder(2)
                    },
                    fail(res) {
                        console.error('pay fail', res)
                    }
                })
            })
        } else {
            app.showToast('请输入充值金额', 'none')
        }
    },
    getUserInfo() {
        const that = this
        app.showLoading('加载中')
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
                    wx.stopPullDownRefresh()
                    wx.hideNavigationBarLoading()
                    app.hideLoading()
                        // result.data.result.level = null
                    if (result.data.code == 0) {
                        that.setData({
                            userInfo: result.data.result,
                            show: true,
                            vipAccount: result.data.result.remainValue,
                            level: result.data.result.level
                        })
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
    onClose() {
        this.setData({
            showMethods: false
        })
    },
    handleGoodsOrder(type) {
        const that = this
        let data = {}
        let account = (this.data.account * 100).toFixed(0)
            //会员余额支付
        if (type == 1) {
            data = {
                tpOrderId: 'XIAO' + Date.parse(new Date()) / 1000 + parseInt((Math.random() * 9) + 1), //订单号
                createTime: new Date().toLocaleString(), //创建时间
                updateTime: new Date().toLocaleString(), //更新时间
                shopIdenty: app.shopIdenty, //店铺id
                shopName: app.shopName, //店铺名
                peopleCount: 1, //就餐人数
                totalPrice: account, //总价
                status: 2, //订单状态
                remark: '余额支付',
                products: [{
                    tpId: '443821176247062500', //菜品id
                    type: 0, //菜品类型
                    name: '微信小程序支付',
                    unit: '斤',
                    price: account, //菜品价格
                    quantity: 1, //菜品份数
                    totalFee: account, //菜品总价
                }], //菜品信息
                payment: {
                    memberId: wx.getStorageSync('customerId'), //会员id
                    memberPassword: md5(this.data.userInfo.memo), //会员支付密码
                    totalDiscountFee: 0, //优惠总金额 优惠总金额=平台优惠总金额+商家优惠总金额,单位：分
                    totalFee: account, //订单总价=商品总额,单位是分，单位：分
                    platformDiscountFee: 0, //平台优惠总金额，单位：分
                    shopDiscountFee: 0, //商家优惠
                    serviceFee: 0, //服务费
                    userFee: account, //用户实付总价
                    shopFee: account, //商户实收总价
                    payType: 1
                }
            }
        } else {
            data = {
                tpOrderId: 'XIAO' + Date.parse(new Date()) / 1000 + parseInt((Math.random() * 9) + 1), //订单号
                createTime: new Date().getTime(), //创建时间
                updateTime: new Date().getTime(), //更新时间
                shopIdenty: app.shopIdenty, //店铺id
                shopName: app.shopName, //店铺名
                peopleCount: 1, //就餐人数
                totalPrice: account, //总价
                status: 2, //订单状态
                remark: '微信支付',
                products: [{
                    tpId: '443821176247062500', //菜品id
                    type: 0, //菜品类型
                    name: '微信小程序支付',
                    unit: '斤',
                    price: account, //菜品价格
                    quantity: 1, //菜品份数
                    totalFee: account, //菜品总价
                }], //菜品信息
                payment: {
                    memberId: wx.getStorageSync('customerId'), //会员id
                    totalDiscountFee: 0, //优惠总金额 优惠总金额=平台优惠总金额+商家优惠总金额,单位：分
                    totalFee: account, //订单总价=商品总额,单位是分，单位：分
                    platformDiscountFee: 0, //平台优惠总金额，单位：分
                    shopDiscountFee: 0, //商家优惠
                    serviceFee: 0, //服务费
                    userFee: account, //用户实付总价
                    shopFee: account, //商户实收总价
                    payType: 3
                }
            }
        }
        app.getSign().then(result => {
            wx.request({
                url: app.baseUrl + '/open/v1/snack/order/create' + app.getPublicKeys(result.result.timestamp) + `&sign=${result.result.sign}`,
                header: {
                    "Content-Type": "application/json"
                },
                method: "POST",
                data,
                success(result) {
                    app.hideLoading()
                    console.log(result)
                    if (result.data.code == 0) {
                        const db = wx.cloud.database()
                        db.collection('customer_order').add({
                            data: {
                                name: that.data.userInfo.customerName,
                                mobile: wx.getStorageSync('mobile'),
                                create_time: new Date().toLocaleString(),
                                account: that.data.account,
                                level: that.data.userInfo.level,
                                payment: type == 1 ? '余额支付' : '微信支付',
                                overage: type == 1 ? (that.data.vipAccount - that.data.account).toFixed(2) : that.data.vipAccount,
                                orderId: result.data.result.orderId,
                                tradeId: result.data.result.tradeId,
                            }
                        }).then(res => {
                            console.log(res)
                        })
                        wx.showModal({
                            title: '提示',
                            content: that.data.account + '元支付成功',
                            showCancel: false,
                            success() {
                                that.getUserInfo()
                            }
                        })
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
    }
})