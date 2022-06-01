const db = wx.cloud.database()
const act = db.collection('activity')
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 对话框的显示变量
    time_show: false,
    type_show: false,
    in_campus_show: false,
    // 时间的限制
    minHour: 10,
    maxHour: 20,
    minDate: new Date(2019, 1, 1).getTime(),
    maxDate: new Date().getTime() + 525600000,
    // 选中的变量
    currentDate: new Date().getTime(),
    currentDateString: '',
    currtype: '志愿者招募',
    curr_in_campus: '校内',
    // 选项
    in_campus_list: [
      { name: '校内', subname: '请在活动详情内注明校区' },
      { name: '校外' }],
    type_list: [
      { name: '全部类型' },
      { name: '志愿者招募', subname: '各大社团或校团委组织的志愿活动' },
      { name: '比赛与选拔' },
      { name: '娱乐活动' },
      { name: '其他' }
    ],
    // flag变量
    is_set_image: false,
    is_post: false,
    is_post_title: false,
    is_post_location: false,
    is_post_traffic: false,
    is_post_contact: false,
    is_post_detail: false,

    // 提交的数据变量
    image_list: [],
    contact: '',
    title: '',
    traffic: '',
    location: '',
    detail: '',
    count: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /*   提交信息:
    绑定: 提交按钮上
    说明: 如果 已经提交过 || 标题没加 || 内容没加
    则不执行提交 */
  submitAll() {
    if (this.data.is_post) return

    if (!this.data.is_post_title ||
      !this.data.is_post_contact) {
      wx.showToast({
        title: '请完善信息',
        icon: 'error'
      })
      return
    }
    act.add({
      data: {
        contact: this.data.contact,
        title: this.data.title,
        traffic: this.data.traffic,
        location: this.data.location,
        detail: this.data.detail,
        in_campus: this.data.curr_in_campus,
        people_num: this.data.count,
        time: this.data.currentDate,
        type: this.data.currtype,
        picture: this.data.image_list
      }
    }).then(res => {
      console.log('发布成功', res);
      this.setData({
        is_post: true
      })

      wx.showToast({
        title: '发布成功',
        icon: 'succes',
      })
      setTimeout(() => {
        wx.reLaunch({
          url: '../Activity_info/Activity_info'
        })
      }, 1000)


    })
      .catch(err => {
      })
  },
  // 每个输入框相应的submit函数
  submitTitle(e) {
    this.setData({
      title: e.detail.value,
      is_post_title: true
    })
  },
  submitLocation(e) {
    this.setData({
      location: e.detail.value,
      is_post_location: true
    })
  },
  submitTraffic(e) {
    this.setData({
      traffic: e.detail.value,
      is_post_traffic: true
    })
  },
  submitContact(e) {
    this.setData({
      contact: e.detail.value,
      is_post_contact: true
    })
  },
  submitDetail(e) {
    this.setData({
      detail: e.detail.value,
      is_post_detail: true
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
      })
      .catch((err) => { })
  },

  // 删除图片
  deleteImage: function (event) {
    // console.log(event)
    this.data.image_list.splice(event.currentTarget.dataset.index, 1)
    let image_list_copy = this.data.image_list
    this.setData({
      image_list: image_list_copy,
    })
  },

  /* 时间模块 */
  // 时间选择1
  showTimeSelect() {
    this.setData({
      time_show: true,
    })
  },

  // 时间选择2
  onTimeClose() {
    this.setData({
      time_show: false,
    })
  },
  // 时间选择3
  onInput(event) {
    this.setData({
      currentDate: event.detail,
      currentDateString: this.secondsToDate(event.detail),
      time_show: false,
    })
  },
  // 处理时间
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


  // 计数器
  onChangeStepper(event) {
    // console.log(event.detail);
    this.setData({
      count: event.detail
    })
  },

  /* 选择类型, 选择是否校内: 3 + 3个函数 */
  showTypeSelect() {
    this.setData({
      type_show: true,
    })
  },

  closeTypeSelect() {
    this.setData({
      type_show: false,
    })
  },

  selectType(event) {
    this.setData({
      currtype: event.detail.name,
    })
  },

  showCampusSelect() {
    this.setData({
      in_campus_show: true,
    })
  },
  selectCampus(e) {
    this.setData({
      curr_in_campus: e.detail.name,
    })
  },
  closeCampusSelect() {
    this.setData({
      in_campus_show: false,
    })
  }

})