const db = wx.cloud.database()
const item_lost = db.collection('item_lost')
const fav = db.collection('favorite')
const forum = db.collection('forum')
const _ = db.command
const comments = db.collection('comments')
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
Dialog.confirm({
  title: '标题',
  message: '弹窗内容',
})
  .then(() => {
    // on confirm
  })
  .catch(() => {
  });


Page({
  onClose() {
    this.setData({
      show_manage_dialog: false,
      show_contact_dialog:false,
      show_more_dialog:false,
    })
  },
  /**
   * 页面的初始数据
   */
  data: {
    open_id: '',
    lost_id: [],
    Index_active: false,
    Post_active: false,
    Person_active: true,

    active_index: '../icons/active_home.png',
    inactive_index: '../icons/inactive_home.png',
    active_post: "../icons/active_post.png",
    inactive_post: "../icons/inactive_post.png",
    active_people: "../icons/active_people.png",
    inactive_people: "../icon/inactive_people.png",

    is_exist_avatar: false,
    is_set_nickname: false,
    is_set_avatar: false,
    is_exist_nickname: false,

    person: {},
    nickname: '',
    picture_url: '',
    show_manage_dialog: false
  },
  getById() {
    console.log('getById',);
    fav
      .where({
        open_id: this.data.open_id,
      })
      .get()
      .then((res) => {
        let person = res.data[0]
        console.log('person.userAvatarUrl', person.userAvatarUrl)
        this.setData({
          person: person,
          nickname: person.userNickName,
          picture_url: person.userAvatarUrl
        })

      })
      .catch((err) => { })


  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    wx.cloud
      .callFunction({
        name: 'login',
      })
      .then((res) => {
        this.setData({
          open_id: res.result.openid,
        })
        console.log('', this.data.open_id)
        this.getById()

      })
      .catch((err) => { })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },

  goIndex() {
    wx.redirectTo({
      url: '../index/index',
    }),
      this.setData({
        Index_active: true,
        Post_active: false,
        Person_active: false,
      })
  },

  goPost() {
    wx.redirectTo({
      url: '../Post/Post',
    }),
      this.setData({
        Index_active: false,
        Post_active: true,
        Person_active: false,
      })
  },

  goPerson() {
    wx.reLaunch({
      url: '../person/person',
    }),
      this.setData({
        Index_active: false,
        Post_active: false,
        Person_active: true,
      })
  },
  submitNickname(e) {
    this.setData({
      nickname: e.detail.value,
      is_set_nickname: true
    })

  },
  submitAll() {
    let person = this.data.person
    person.userAvatarUrl = this.data.picture_url
    person.userNickName = this.data.nickname
    this.setData({
      person: person
    })

    console.log('person.userNickName', person.userNickName)
    console.log('执行了这个 data修改', this.data.person.userAvatarUrl)
    // 用户表修改
    fav.where({
      open_id: this.data.open_id
    }).update({
      data: {
        userAvatarUrl: this.data.person.userAvatarUrl,
        userNickName: this.data.person.userNickName
      }
    }).then(res => {
      console.log('成功', res)

      // this.getById()
    }).catch(err => {
      console.log('失败', err)
    })

    // 论坛表修改
    forum.where({
      publisher_id: this.data.open_id
    }).update({
      data: {
        user_image: this.data.person.userAvatarUrl,
        user_name: this.data.person.userNickName
      }
    }).then(res => {
      console.log('成功', res)
    }).catch(err => {
      console.log('失败', err)
    })

    // 评论表修改
    comments.where({
      publisher_id: this.data.open_id
    }).update({
      data: {
        user_image: this.data.person.userAvatarUrl,
        user_name: this.data.person.userNickName
      }
    }).then(res => {
      console.log('成功', res)
    }).catch(err => {
      console.log('失败', err)
    })

  },
  showManageDialog() {
    this.setData({
      show_manage_dialog: true,
      picture_url: this.data.person.userAvatarUrl,
      nickname: this.data.person.userNickName
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
              is_set_avatar: true
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

  showContact(){
    this.setData({
      show_contact_dialog:true,
    })
  },

  closeContact(){
    this.setData({
      show_contact_dialog:false,
    })
  },

  showMore(){
    this.setData({
      show_more_dialog:true,
    })
  },

  closeMore(){
    this.setData({
      show_more_dialog:false,
    })
  },
  //图片放大
  preview_picture(event) {
    console.log(event)
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })
  },
})
