const app = getApp()
Page({
  data: {
    Latitude: '29.589720809',
    longitude: '106.224637405',
    address: '', //门牌号
    customerName: '', //顾客名字
    tel: '', //顾客电话
    addressName: '',
    addressDetail: '',
    addLatitude: '',
    addLongitude: '',
    distance: '', //距离
    id: '',
    type: ''
  },
  onLoad: function (options) {
    this.setData({
      type: options.type
    })
    if (options.type == 2) {
      this.getAddressInfo(options.id)
    }
  },
  getAddressInfo(id) {
    app.showLoading('加载中')
    const that = this
    const db = wx.cloud.database()
    db.collection('customer_address').doc(id).get({
      success: function (res) {
        // res.data 包含该记录的数据
        app.hideLoading()
        that.setData({
          address: res.data.address,
          customerName: res.data.user_name,
          tel: res.data.mobile,
          addressName: res.data.address_name,
          addressDetail: res.data.addressDetail,
          addLongitude: res.data.latitude,
          addLongitude: res.data.longitude,
          id: res.data._id
        })
      }
    })
  },
  chooseAddress() {
    const that = this
    wx.getSetting({
      success(res) {
        console.log(res.authSetting["scope.userLocation"])
        if (res.authSetting["scope.userLocation"] == false) {
          wx.showModal({
            content:'请先授权位置信息',
            success(c){
              if(c.confirm){
                wx.openSetting({
                  withSubscriptions: true,
                })
              }
            }
          })
        }else {
          wx.chooseLocation({
            success(res) {
              if (res.address && res.name) {
                let s = (app.getDistance(that.data.Latitude, that.data.longitude, res.latitude, res.longitude)).toFixed(2)
                console.log(s)
                if (s > 2) {
                  wx.showModal({
                    title: '提示',
                    content: '该距离超出配送范围，请重新选择',
                    showCancel: false
                  })
                } else {
                  that.setData({
                    addressName: res.name,
                    addressDetail: res.address,
                    addLatitude: res.latitude,
                    addLongitude: res.longitude,
                    distancee: s
                  })
                }
              }
  
            }
          })

        }

      }
    })
    // return
  },
  handleAddAddress(e) {
    let {
      address,
      customerName,
      tel
    } = e.detail.value
    console.log(address, customerName, tel)

    if (this.data.addressName == '' && this.data.addressDetail == '') {
      app.showToast('请选择收货地址', 'none')
      return false
    }
    if (address == '') {
      app.showToast('请输入门牌号', 'none')
      return false
    }
    if (customerName == '') {
      app.showToast('请输入联系人', 'none')
      return false
    }
    if (!/^[1][3,4,5,7,8,9][0-9]{9}$/.test(tel)) {
      app.showToast('请输入正确手机号', 'none')
      return false
    }

    const db = wx.cloud.database()
    app.showLoading('')
    if (this.data.type == 1) {
      db.collection('customer_address').add({
        data: {
          user_id: wx.getStorageSync('customerId'),
          address_name: this.data.addressName,
          addressDetail: this.data.addressDetail,
          user_name: customerName,
          address: address,
          mobile: tel,
          latitude: this.data.addLatitude,
          longitude: this.data.addLongitude,
          distance: this.data.distance,
          isdefault: false
        }
      }).then(res => {
        app.hideLoading()

        console.log(res)
        if (res.errMsg == 'collection.add:ok') {
          wx.showModal({
            title: '提示',
            content: '添加成功',
            showCancel: false,
            success() {
              wx.navigateBack({
                delta: 1,
              })
            }
          })
        }
      })
    } else {
      db.collection('customer_address').doc(this.data.id).update({
        // data 传入需要局部更新的数据
        data: {
          user_id: wx.getStorageSync('customerId'),
          address_name: this.data.addressName,
          addressDetail: this.data.addressDetail,
          user_name: customerName,
          address: address,
          mobile: tel,
          latitude: this.data.addLatitude,
          longitude: this.data.addLongitude,
        }
      }).then(res => {
        app.hideLoading()
        if (res.errMsg == 'document.update:ok') {
          wx.showModal({
            title: '提示',
            content: '修改成功',
            showCancel: false,
            success() {
              wx.navigateBack({
                delta: 1,
              })
            }
          })
        }
      })
    }

  },

})