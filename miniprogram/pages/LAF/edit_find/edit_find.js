var app = getApp()
const db = wx.cloud.database()
const item_lost = db.collection('item_lost')
var that = this

const fav = db.collection('favorite')
Page({
  onLoad: function (options) {
    this.setData({
      // currentDateString: this.secondsToDate(this.data.currentDate),
      item_id: options.id
    })

    // 获取并设置当前用户的openid
    wx.cloud
      .callFunction({
        name: 'login',
      })
      .then((res) => {
        console.log('成功', res)
        this.setData({
          open_id: res.result.openid,
        })
      })
      .catch((err) => { })

    item_lost.where({
      _id: options.id
    }).get().then(res => {
      console.log('res', res)
      this.setData({

        contact_value: res.data[0].contact,
        detail_value: res.data[0].detail,
        findPlace: res.data[0].location,
        // TODO
        picture_url: res.data[0].picture,
        reserve_loc_value: res.data[0].reserve_loc,
        currentDate: res.data[0].time_found,
        category_value: res.data[0].type,
        currentDateString: this.secondsToDate(res.data[0].time_found)
      })
    })
  },
  data: {
    open_id: '',
    item_id: '',
    // 是否发布 用来防止重复发布
    is_post: false,
    //图片
    picture_url: 'https://i.loli.net/2021/05/11/XatEG2gbmcHZuxw.png',
    is_set_picture: false,
    //相应的填写值
    is_set_reserve_loc_value: false,
    reserve_loc_value: '',
    is_set_contact_value: false,
    contact_value: '',
    is_set_detail_value: false,
    detail_value: '',
    is_set_category_value: false,
    category_value: '选择类别',
    is_set_findPlace: false,
    findPlace: '选择地点',

    //展示弹出层
    show_place: false,
    show_time: false,
    //展示发布确认框
    show_post_confirm: false,
    //单选按钮
    radio_findPlace: '1',
    radio_setPlace: '1',
    radio_category: '1',
    // placeList: ['第一教学楼', '图书馆', '综合楼', '艺术楼', '第一实验楼', '第二实验楼', '一食堂和四食堂', '二食堂', '三食堂', '学生活动中心', '小剧场', '大剧场', '松园体育场', '梅园体育场', '校车站', '其他'],
    placeList: [
      { name: '第一教学楼', },
      { name: '图书馆', },
      { name: '综合楼', },
      { name: '艺术楼', },
      { name: '第一实验楼', },
      { name: '第二实验楼', },
      { name: '一食堂和四食堂', },
      { name: '二食堂', },
      { name: '三食堂', },
      { name: '学生活动中心', },
      { name: '小剧场', },
      { name: '大剧场', },
      { name: '松园体育场', },
      { name: '梅园体育场', },
      { name: '校车站', },
      { name: '其他', },
    ],

    // categoryList: ['证件', '电子设备', '衣物', '文具', '书籍', '日用品', '雨伞和水杯', '其他'],
    categoryList: [
      { name: '证件', },
      { name: '电子设备', },
      { name: '衣物', },
      { name: '文具', },
      { name: '书籍', },
      { name: '日用品', },
      { name: '雨伞和水杯', },
      { name: '其他', },
    ],
    //颜色
    // findPlaceColor: "orange",
    // setPlaceColor: "RGBA(221, 59, 39,0.7)",
    // categoryColor: "RGB(255, 202, 40)",
    findPlaceColor: 'black',
    setPlaceColor: 'black',
    categoryColor: 'black',
    //时间相关
    minHour: 10,
    maxHour: 20,
    minDate: new Date(2019, 1, 1).getTime(),
    maxDate: new Date().getTime(),
    currentDate: new Date().getTime(),
    currentDateString: '',
  },
  secondsToDate(seconds) {
    //不显示秒 + 时间补0
    var date = new Date(seconds)
    date.setSeconds(0)
    var DateTime =
      date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    let H =
      date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':'
    let M = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    let tim = DateTime + ' ' + H + M
    return tim
  },
  reserveInput(e) {
    this.setData({
      reserve_loc_value: e.detail.value,
      is_set_reserve_loc_value: true,
    })
    console.log('contactInput', this.data.reserve_loc_value)
  },
  contactInput(e) {
    this.setData({
      contact_value: e.detail.value,
      is_set_contact_value: true,
    })
    // console.log('contactInput',this.data.contact_value)
  },
  detailInput(e) {
    this.setData({
      detail_value: e.detail.value,
      is_set_detail_value: true,
    })
    // console.log('detailtInput',this.data.detail_value)
  },
  doInsert() {
    if (this.data.is_post) return
    // if (
    //   !this.data.is_set_category_value ||
    //   !this.data.is_set_contact_value ||
    //   !this.data.is_set_detail_value ||
    //   !this.data.is_set_findPlace ||
    //   !this.data.is_set_picture ||
    //   !this.data.is_set_reserve_loc_value
    // ) {
    //   wx.showToast({
    //     title: '请完善信息',
    //     icon: 'error',
    //   })
    // } else {
    this.setData({
      show_post_confirm: true,
    })
    // }
  },
  postCancel() {
    this.setData({
      show_post_confirm: false,
    })
  },
  postConfirm() {
    item_lost.where({
      _id: this.data.item_id
    }).update({
      data: {
        contact: this.data.contact_value,
        detail: this.data.detail_value,
        location: this.data.findPlace,
        // TODO
        picture: this.data.picture_url,
        reserve_loc: this.data.reserve_loc_value,
        time_found: this.data.currentDate,
        type: this.data.category_value,
      },
    })
      .then((res) => {
        console.log('发布成功', res)
        this.data.is_post = true
        wx.showToast({
          title: '编辑成功',
          icon: 'succes',
        }),
          // fav
          //   .where({
          //     open_id: this.data.open_id,
          //   })
          //   .get()
          //   .then((result) => {
          //     console.log('根据openid', result)
          //     // 因为发布的时候就不可能审查是否是一样的东西
          //     // 所以, 我只能无脑的把id加进去
          //     let lost_id = res._id
          //     let lost_list = result.data[0].lost_list
          //     lost_list.push(lost_id)

          //     fav
          //       .where({
          //         open_id: this.data.open_id,
          //       })
          //       .update({
          //         data: {
          //           lost_list: lost_list,
          //         },
          //       })
          //       .then((res) => {
          //         console.log('成功写回', res)
          //       })
          //       .catch((err) => {})
          //   })
          //   .catch((err) => {})

          setTimeout(function () {
            wx.navigateTo({
              url: '../../person/MyFavor_post/MyFavor_post',
            })
          }, 1200)
      })
      .catch((err) => {
        console.log('失败', err)
      })
  },
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })
      .then((res) => {
        const filePath = res.tempFilePaths[0]
        // console.log('filePath', filePath)

        // 上传图片
        const cloudPath =
          Math.random().toString(36).slice(-10) + filePath.match(/\.[^.]+?$/)[0]
        // console.log('cloudPath', cloudPath)
        wx.cloud
          .uploadFile({
            cloudPath,
            filePath,
          })
          .then((res2) => {
            console.log('[上传文件] 成功：', res2)

            this.setData({
              picture_url: res2.fileID,
              is_set_picture: true,
            })
            console.log(this.data.picture_url)
            app.globalData.fileID = res2.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
          })
          .catch((err) => { })
      })
      .catch((err) => { })
  },

  // 弹出层选定地点的响应函数
  selectPlace(event) {
    this.setData({
      findPlace: event.detail.name,
      is_set_findPlace: true,
      show_place: false,
    })
  },
  //弹出层相应事件
  showPlacePopup() {
    this.setData({
      show_place: true,
    })
  },
  showCategoryPopup() {
    this.setData({
      show_category: true,
    })
  },
  showTimePopup() {
    this.setData({
      show_time: true,
    })
  },

  onPlaceClose() {
    this.setData({
      show_place: false,
    })
  },
  onCategoryClose() {
    this.setData({
      show_category: false,
    })
  },
  onTimeClose() {
    this.setData({
      show_time: false,
    })
  },
  //物品类别单选框表单响应事件
  selectCategory(event) {
    this.setData({
      category_value: event.detail.name,
      is_set_category_value: true,
      show_category: false,
    })
  },
  //时间相应函数
  onInput(event) {
    this.setData({
      currentDate: event.detail,
      currentDateString: this.secondsToDate(event.detail),
      show_time: false,
    })
    // console.log('onInput', this.data.currentDate)
  },


})
