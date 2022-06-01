const db = wx.cloud.database()
const deal = db.collection('Deal')
const fav = db.collection('favorite')
var app = getApp()

Page({
  data: {
    item_id: '',

    type_list: [
      { name: '全部类型', },
      { name: '自行车', },
      { name: '数码设备', subname: '电子产品', },
      {
        name: '数码外设', subname: '键盘、鼠标或支架等',
        //subname: '描述信息',        
        //openType: 'share',      
      },
      { name: '会员卡', },
      { name: '门票', subname: '电影票、演出和赛事门票', },
      { name: '其他', },
    ],
    area_list: [
      { name: '全部校区', },
      { name: '重大A区', },
      { name: '重大B区', },
      { name: '重大C区', },
      { name: '重大D区', subname: '虎溪校区', },
    ],
    currArea: '全部校区',
    currType: '全部类型',
    show_area: false,
    show_type: false,

    is_post: false,
    is_set_image: false,
    is_post_title: false,
    is_post_price: false,
    is_post_contact: false,
    is_post_picture: false,

    image_list: [],
    title: '',
    count: 0,
    price: 0,
    contact: '',
    detail: '',
  },
  onLoad(options) {
    //   编辑前先获取所有信息
    deal.where({
      _id: options.id
    }).get().then(res => {
      this.setData({
        title: res.data[0].title,
        contact: res.data[0].contact,
        detail: res.data[0].detail,
        count: res.data[0].number,
        price: res.data[0].price,
        currArea: res.data[0].zone,
        currType: res.data[0].type,
        image_list: res.data[0].picture,
        item_id: options.id
      })
    }).catch(err => {
      console.log('失败')
    })
  },
  submitAll() {
    // 在deal中添加记录
    if (this.data.is_post) return

    deal.where({
      _id: this.data.item_id
    }).update({
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
      console.log('修改的data变量',this.data.detail)
      // this.data.is_post = true
      this.setData({
        is_post: true
      })
      wx.showToast({
        title: '编辑成功',
        icon: 'succes',
      })

      setTimeout(function () {
        wx.navigateTo({
          url: '../../person/MyFavor_post/MyFavor_post',
        })
      }, 1200)
    }).catch(err => {
      console.log('发布失败', err)
    })
  },
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
              // console.log('[上传文件] 成功：', res2)
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


  deleteImage: function (event) {
    // console.log(event)
    this.data.image_list.splice(event.currentTarget.dataset.index, 1)
    let image_list_copy = this.data.image_list
    this.setData({
      image_list: image_list_copy,
    })
  },

  /* 非正常编辑 */
  onChangeStepper(event) {
    // console.log(event.detail);
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
      price: event.detail,
      is_post_price: true
    })
  },
  submitContact(event) {
    // console.log(event.detail)
    this.setData({
      contact: event.detail,
      is_post_contact: true
    })
  },
  submitTitle(event) {
    // console.log(event.detail)
    this.setData({
      title: event.detail,
      is_post_title: true
    })
  },

  submitDetail(event) {
    // console.log('输入的东西',event.detail)
    this.setData({
      detail: event.detail
    })
    // console.log('修改的data变量',this.data.detail)
  },

})
