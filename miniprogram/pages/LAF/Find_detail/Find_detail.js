const db = wx.cloud.database()
const lost = db.collection('item_lost')
const fav = db.collection('favorite')
const _ = db.command

Page({
  data: {
    flag: false, //是否弹出确认页面
    item_record: {},
    iscollected: false,
    open_id: '',
    favorite_inactive: 'https://ftp.bmp.ovh/imgs/2021/05/a046bb1dc2c0540a.png',
    favorite_active: 'https://ftp.bmp.ovh/imgs/2021/05/ec709308f347b170.png',
  },
  // TODO 暂留
  handleCancel() {
    // @note 页面上的iscollected置反
    let coll_flag = !this.data.iscollected
    this.setData({
      iscollected: coll_flag,
    })

    // 先看看这个人的收藏列表
    fav
      .where({
        open_id: this.data.open_id,
      })
      .get()
      .then((res) => {
        // console.log('查询成功', res);
        // 获取记录信息的对象
        let lost_id = this.PageData.id
        let find_favor = res.data[0].find_favor
        // console.log('find_favor=', find_favor)

        // 修改为false
        find_favor[lost_id] = false
        // 写回数据库
        fav
          .where({
            open_id: this.data.open_id,
          })
          .update({
            data: {
              find_favor: find_favor,
            },
          })
          .then((res) => {
            console.log('写回数据库成功', res)
          })
          .catch((err) => { })
      })
      .catch((err) => { })
  },
  // 点击确定按钮的响应事件
  onConfirm() {
    // 更新记录
    lost
      .doc(this.PageData.id)
      .update({
        data: {
          // 将is_found设置为true
          is_found: true,
        },
      })
      .then((res) => {
        // 先看看这个人的收藏列表
        fav
          .where({
            open_id: this.data.open_id,
          })
          .get()
          .then((res) => {
            // console.log('collection', res);

            // 获取记录信息的对象
            let find_favor = res.data[0].find_favor
            let lost_id = this.PageData.id
            // console.log('find_favor=', find_favor)

            // 不存在=>在json中新增key
            // 存在=>在json中找到, 把false置true

            find_favor[lost_id] = true

            // 写回数据库
            fav
              .where({
                open_id: this.data.open_id,
              })
              .update({
                data: {
                  find_favor: find_favor,
                },
              })
              .then((res) => {
                console.log('写回数据库成功', res)
              })
              .catch((err) => { })
          })
          .catch((err) => {
            console.log('', err)
          })
        // console.log('成功', res);
        // console.log('回到find', );
        wx.showToast({
          title: '领取成功',
          icon: 'succes',
        }),
          setTimeout(function () {
            wx.navigateTo({
              url: '../Find_info/Find_info',
            })
          }, 1200)
      })
      .catch((err) => {
        // console.log('失败', err);
      })
  },
  PageData: {
    id: '',
  },
  // 处理日期函数
  secondsToDate: function (seconds) {
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
  //图片放大
  preview_picture(event) {
    console.log(event)
    wx.previewImage({
      urls: [event.currentTarget.dataset.src],
    })
  },

  // 关闭对话框事件
  onClose() {
    this.setData({
      flag: false,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 将获取的id赋值
    this.PageData.id = options.id
    // 根据id查询当条数据, 渲染当前页面
    lost
      .doc(options.id)
      .get()
      .then((res) => {
        let ret = this.secondsToDate(res.data.time_found)
        res.data.time_found = ret
        this.setData({
          item_record: res.data,
        })
      })
    // 获取并设置当前用户的openid
    wx.cloud
      .callFunction({
        name: 'login',
      })
      .then((res) => {
        // console.log('成功', res);
        this.setData({
          open_id: res.result.openid,
        })
        // 数据库查询该记录的收藏状态
        fav
          .where({
            open_id: this.data.open_id,
          })
          .get()
          .then((res) => {
            let lost_id = this.PageData.id
            let find_favor = res.data[0].find_favor
            let list = Object.keys(find_favor)

            // console.log('Object.keys(find_favor)=', Object.keys(find_favor));

            // 找到key 并且为true, iscollected置位true
            var exist = list.find(function (e) {
              return e === lost_id
            })

            if (exist && find_favor[lost_id]) {
              // console.log('iscollected');
              this.setData({
                iscollected: true,
              })
            }
          })
          .catch((err) => { })
      })
      .catch((err) => { })
  },

  /**
   * 用户点击我要领取
   */
  get: function () {
    this.setData({
      flag: true,
    })
  },
})
