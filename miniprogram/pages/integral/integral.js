const app = getApp()
Page({
    data: {
        coins: '',
        value: 0,
        content: ''
    },
    onLoad: function (options) {
        this.getCoins()
    },
    getCoins() {
        app.showLoading('加载中')
        const that = this
        app.getSign().then(res => {
            wx.request({
                url: app.baseUrl + '/open/v1/crm/getCustomerDetailById' + app.getPublicKeys(res.result.timestamp) + `&sign=${res.result.sign}`,
                method: "POST",
                data: {
                    customerId: wx.getStorageSync('customerId')
                },
                success(result) {
                    app.hideLoading()
                    console.log(result);
                    if (result.data.code == 0) {
                        that.setData({
                            coins: result.data.result.integral,
                            content: result.data.result.integral,
                            value:100
                        })
                    }
                }
            })
        })
    }

})