import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
const db = wx.cloud.database()
const fav = db.collection('favorite')
const _ = db.command

Dialog.confirm({
  title: '标题',
  message: '弹窗内容',
})
  .then(() => {
    // on confirm
  })
  .catch(() => {
    // on cancel
  });

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 是否第一次进入页面
    is_first: false,
    show_detail1: false,
    show_detail2: false,
    show_detail3: false,

    Index_active: true,//初始停留在index主页
    Post_active: false,
    Person_active: false,

    active_index: '../icons/active_home.png',
    inactive_index: '../icons/inactive_home.png',
    active_post: "../icons/active_post.png",
    inactive_post: "../icons/inactive_post.png",
    active_people: "../icons/active_people.png",
    inactive_people: "../icons/inactive_people.png",

    // 小程序演示
    row: 0,
    active: 0,
    // 演示图片数组
    stepPictures: [],
    steps: [
      [{
        text: '步骤一',
        desc: '描述信息',
      },
      {
        text: '步骤二',
        desc: '描述信息',
      },
      {
        text: '步骤三',
        desc: '描述信息',
      },
      {
        text: '步骤四',
        desc: '描述信息',
      }],
      [{
        text: '步骤五',
        desc: '描述信息',
      },
      {
        text: '步骤六',
        desc: '描述信息',
      },
      {
        text: '步骤七',
        desc: '描述信息',
      },
      {
        text: '步骤八',
        desc: '描述信息',
      }],
    ],
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
        // console.log('成功', res)
        let open_id = res.result.openid
        fav.where({
          open_id: open_id
        }).get().then(res => {
          console.log('', res);
          if (res.data.length === 0) {

            // this.setData({
            //   is_first: true
            // })
            console.log('查不到',);
            let init_obj = { 1: 'true' }
            let init_list = ['1']
            fav
              .add({
                data: {
                  open_id: open_id,
                  deal_favor: init_obj,
                  find_favor: init_obj,
                  forum_favor: init_obj,
                  lost_list: init_list,
                  forum_list: init_list,
                  deal_list: init_list,
                  userAvatarUrl: "https://i.loli.net/2021/05/23/sp9aojxfPmKMVSq.png",
                  userNickName: '用户 ' + open_id.substring(open_id.length - 6),
                },
              })
              .then((res) => {
                console.log('写入数据库成功', res)
              })
              .catch((err) => { })
          }
        })
          .catch(err => {
          })

      })
      .catch((err) => { })
  },
  nextStep:function() {
    let row = this.data.row
    let col = this.data.active
    col ++
    if(col == this.data.steps[row].length) row ++,col = 0 
    if(row == this.data.steps.length) row = 0
    this.setData({
      row: row,
      active: col
    })
  },
  lastStep:function() {
    let row = this.data.row
    let col = this.data.active
    col --
    if(col < 0){
      row = (row - 1 + this.data.steps.length)%(this.data.steps.length)
      col = this.data.steps[row].length - 1 
    } 
    this.setData({
      row: row,
      active: col
    })
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
  onUnload: function () {
  },

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
  /**
   * 跳转失物招领界面
   */
  find: function () { },

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

  showDetail1() {
    this.setData({
      show_detail1: true,
    })
  },

  showDetail2() {
    this.setData({
      show_detail2: true,
    })
  },

  showDetail3() {
    this.setData({
      show_detail3: true,
    })
  },

  closeDetail() {
    this.setData({
      show_detail1: false,
      show_detail2: false,
      show_detail3: false,
    })
  },

  getUserInfo(event) {
    console.log(event.detail);
  },
})
