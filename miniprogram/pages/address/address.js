const app = getApp()
Page({
  data: {
    addressList: []
  },
  onShow: function (options) {
    this.getAddressList()
  },
  getAddressList() {
    const that = this
    const db = wx.cloud.database()
    db.collection('customer_address').where({
        user_id: wx.getStorageSync('customerId')
      })
      .get({
        success: function (res) {
          console.log(res.data)
          that.setData({
            addressList: res.data
          })
        }
      })
  },
  handleAddress(e) {
    const that = this
    let i = e.currentTarget.dataset.i
    let item = e.currentTarget.dataset.item
    if (i == 1) {
      if (!item.isdefault) {
        app.showLoading('请稍后')
        const db = wx.cloud.database()
        this.data.addressList.forEach(el => {
          if (el.isdefault) {
            db.collection('customer_address').doc(el._id).update({
              data: {
                isdefault: false
              }
            })
          }
        })
        db.collection('customer_address').doc(item._id).update({
          // data 传入需要局部更新的数据
          data: {
            // 表示将 done 字段置为 true
            isdefault: true
          }
        }).then(res => {
          this.getAddressList()
          app.hideLoading()
          app.showToast('设置成功', 'success')
        })
      }
    } else if (i == 2) {
      app.navigator('/pages/addAddress/addAddress?id='+item._id +'&type=2')
    } else {
      wx.showModal({
        title: '提示',
        content: '是否删除该地址？',
        success(c) {
          if (c.confirm) {
            app.showLoading('删除中')
            const db = wx.cloud.database()
            db.collection('customer_address').doc(item._id).remove().then(res => {
              that.getAddressList()
              app.hideLoading()
              app.showToast('删除成功', 'success')
            })
          }
        }
      })
    }
  }
})