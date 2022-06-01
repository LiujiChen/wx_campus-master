const db = wx.cloud.database()
const deal = db.collection('Deal')
const fav = db.collection('favorite')

var app = getApp()
Page({
  // 数据
  data: {

    type_list: [
      { name: '全部类型', value: 't0', },
      { name: '自行车', value: 't1', },
      { name: '数码设备', subname: '电子产品', value: 't2', },
      {
        name: '数码外设', subname: '键盘、鼠标或支架等', value: 't3',
        //subname: '描述信息',
        //openType: 'share',
      },
      { name: '会员卡', value: 't4', },
      { name: '门票', subname: '电影票、演出和赛事门票', },
      { name: '其他', },
    ],
    area_list: [
      { name: '全部校区', value: 'o0', },
      { name: '重大A区', value: 'o1', },
      { name: '重大B区', value: 'o2', },
      { name: '重大C区', value: 'o3', },
      { name: '重大D区', subname: '虎溪校区', value: 'o4', },
    ],
    currArea: '全部校区',
    currType: '全部类型',
    is_set_image: false,
    show_area: false,
    show_type: false,

    image_list: [],
    title: '',
    count: 1,
    price: 0,
    contact: '',
    detail: '',

    is_post: false,
    is_post_title: false,
    is_post_price: false,
    is_post_contact: false,
    is_post_picture: false

  },
  submitAll() {
    // 在deal中添加记录
    if (this.data.is_post) return

    if (!this.data.is_post_title ||
      !this.data.is_post_price ||
      !this.data.is_post_contact) {
      wx.showToast({
        title: '请完善信息',
        icon: 'error'
      })
      return
    }

    deal.add({
      data: {
        title: this.data.title,
        contact: this.data.contact,
        detail: this.data.detail,
        number: this.data.count,
        price: this.data.price,
        zone: this.data.currArea,
        type: this.data.currType,
        picture: this.data.image_list
      },
    }).then((res1) => {
      console.log('发布成功', res1)
      // this.data.is_post = true
      this.setData({
        is_post: true
      })

      wx.showToast({
        title: '发布成功',
        icon: 'succes',
      })

      wx.cloud
        .callFunction({
          name: 'login',
        })
        .then((res) => {
          console.log('成功', res)
          // this.setData({
          //   open_id: res.result.openid,
          // })
          let open_id = res.result.openid

          fav.where({
            open_id: open_id
          }).get().then(res => {
            console.log('fav成功', res)

            let list = res.data[0].deal_list
            console.log('list', list)

            list.push(res1._id)
            console.log('list', list)

            fav.where({
              open_id: open_id
            }).update({
              data: {
                deal_list: list
              }
            }).then(res => {
              console.log('协会成功', res)
            }).catch(err => {
              console.log(err)
            })


          }).catch(err => {
            console.log(err)
          })
        })
        .catch((err) => { })

      setTimeout(function () {
        wx.navigateTo({
          url: '../Deal_info/Deal_info',
        })
      }, 1200)
    }).catch(err => {
      console.log('发布失败', err)
    })
  },

  // 添加图片
  addImage() {
    // 选择图片
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })
      .then((res) => {
        let image_list_copy = this.data.image_list
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          // 上传图片
          const filePath = res.tempFilePaths[i]
          const cloudPath =
            Math.random().toString(36).slice(-10) +
            filePath.match(/\.[^.]+?$/)[0]
          // console.log('cloudPath', cloudPath)
          wx.cloud
            .uploadFile({
              cloudPath,
              filePath,
            })
            .then((res2) => {
              console.log('[上传文件] 成功：', res2)
              // console.log(this.data.picture_url)
              app.globalData.fileID = res2.fileID
              app.globalData.cloudPath = cloudPath
              app.globalData.imagePath = filePath
              image_list_copy.push(res2.fileID)
              // console.log('上传=',image_list_copy)
              this.setData({
                image_list: image_list_copy,
                is_set_image: true,
              })
            })
            .catch((err) => {
              console.log('失败', err)
            })
          // console.log('总上传',image_list_copy)
        }
        // console.log('res',image_list_copy)
        // image_list_copy.push(res.tempFilePaths[i])
      })
      .catch((err) => { })
  },

  // 删除图片
  deleteImage: function (event) {
    console.log(event)
    this.data.image_list.splice(event.currentTarget.dataset.index, 1)
    let image_list_copy = this.data.image_list
    this.setData({
      image_list: image_list_copy,
    })
  },

  /* 非正常编辑 */
  onChangeStepper(event) {
    console.log(event.detail);
    this.setData({
      count: event.detail
    })
  },

  showAreaPopOut() {
    this.setData({
      show_area: true,
    })
  },
  showTypePopOut() {
    this.setData({
      show_type: true,
    })
  },
  closePopOut() {
    this.setData({
      show_area: false,
      show_type: false
    })
  },

  selectArea(event) {
    this.setData({
      currArea: event.detail.name,
    })
  },

  selectType(event) {
    this.setData({
      currType: event.detail.name,
    })
  },

  /* 正常编辑 */
  submitPrice(event) {
    // console.log(event.detail)
    this.setData({
      price: event.detail.value,
      is_post_price: true
    })
  },
  submitContact(event) {
    // console.log(event.detail)
    this.setData({
      contact: event.detail.value,
      is_post_contact: true
    })
  },
  submitTitle(event) {
    // console.log(event.detail)
    this.setData({
      title: event.detail.value,
      is_post_title: true
    })
  },

  submitDetail(event) {
    this.setData({
      detail: event.detail.value
    })
  },


})
