const app = getApp()
Page({
    data: {
        list: [],
        totalNum: 0,
        show: false,
        page: 0,
        pageSize: 10,
    },
    onShow() {
        if (wx.getStorageSync('mobile') && wx.getStorageSync('customerId')) {
            this.getTotalNum()
            this.setData({
                show: true
            })
        } else {
            this.setData({
                show: false
            })
        }
    },
    onReachBottom() {
        console.log(12312312312);
        if ((this.data.page * 1 + 1) * 10 < this.data.totalNum) {
            const page = this.data.page * 1
            this.setData({
                page: page + 1
            }, () => {
                this.getList()
            })
        }
    },
    getList() {
        app.showLoading('加载中')
        const that = this
        const db = wx.cloud.database()
        db.collection('customer_order').where({
            mobile: wx.getStorageSync('mobile')
        }).skip(that.data.page).limit((this.data.totalNum - this.data.list.length) > 10 ? 10 : (this.data.totalNum - this.data.list.length)).get({
            success: function(res) {
                app.hideLoading()
                wx.hideNavigationBarLoading()
                wx.stopPullDownRefresh()
                console.log(res)
                if (res.errMsg == 'collection.get:ok') {
                    if (that.data.page == 0) {
                        that.setData({
                            list: res.data.reverse()
                        })
                    } else {
                        let data = that.data.list
                        data.push(...res.data.reverse())
                        that.setData({
                            list: data,
                        })
                    }
                }
            }
        })
    },
    getTotalNum() {
        const that = this
        const db = wx.cloud.database()
        db.collection('customer_order').where({
            mobile: wx.getStorageSync('mobile')
        }).count().then(res => {
            console.log(res);
            if (res.errMsg == 'collection.count:ok') {
                that.setData({
                    totalNum: res.total
                }, () => {
                    that.getList()
                })
            }
        })
    },
    handleOrderDetail(e) {
        let item = e.currentTarget.dataset.item
        if (item.isTakeaway) {
            wx.navigateTo({
                url: '/pages/orderDetail/orderDetail?id=' + item._id,
            })
        }
    }
})