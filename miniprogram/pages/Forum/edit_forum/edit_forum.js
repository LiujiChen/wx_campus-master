const db = wx.cloud.database()
const forum = db.collection('forum')
const fav = db.collection('favorite')

Page({
  onTransmit: function (params) {
    if (this.data.is_post) return
    const that = this
    // 获取编辑器内容
    that.editorCtx.getContents({
      success: (res) => {
        that.data.is_post = true
        let str = JSON.stringify(res.delta)
        var now = new Date().getTime()

        // 在forum中添加记录
        forum
          .where({
            _id: this.data.item_id,
          })
          .update({
            data: {
              // TODO 若保留原来的发布时间则注释下面这句话
              time_publish: now,
              title: this.data.title_val,
              tag: this.data.tag_val,
              content: str,
            },
          })
          .then((res) => {
            console.log('编辑成功', res)
            this.data.is_post = true
            wx.showToast({
              title: '编辑成功',
              icon: 'succes',
            })
            console.log('this.data.open_id', this.data.open_id)
            //   fav
            //     .where({
            //       open_id: this.data.open_id,
            //     })
            //     .get()
            //     .then((result) => {
            //       console.log('根据openid', result)
            //       // 因为发布的时候就不可能审查是否是一样的东西
            //       // 所以, 我只能无脑的把id加进去
            //       let forum_id = res._id
            //       let forum_list = result.data[0].forum_list
            //       forum_list.push(forum_id)

            //       console.log('forum_list',forum_list)

            //       fav
            //         .where({
            //           open_id: this.data.open_id,
            //         })
            //         .update({
            //           data: {
            //             forum_list: forum_list,
            //           },
            //         })
            //         .then((res) => {
            //           console.log('成功写回', res)
            //         })
            //         .catch((err) => {})
            //     })
            //     .catch((err) => {})
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
      fail: (error) => {
        console.log(error)
      },
    })
  },
  data: {
    title_val: '',
    tag_val: '',
    is_post: false,

    item_id: '',
    open_id: '',

    content: '',
    // 富文本变量
    formats: {},
    readOnly: false,
    placeholder: '开始输入...',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,

  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly,
    })
  },
  onLoad(options) {
    this.setData({
      item_id: options.id,
    })

    wx.cloud
      .callFunction({
        name: 'login',
      })
      .then((res) => {
        // console.log('成功', res)
        this.setData({
          open_id: res.result.openid,
        })

        // 套娃把查询帖子id
        forum
          .doc(options.id)
          .get()
          .then((res) => {
            this.setData({
              title_val: res.data.title,
              tag_val: res.data.tag,
            })

            console.log('根据id查询到的res', res)
            // 富文本初始化
            let that = this
            //content是从数据库获取的数据里的delta字符串，然后装换为json
            // console.log('that.data.item.content',that.data.item.content)
            var content = JSON.parse(res.data.content)
            // console.log('content=',content)
            wx.createSelectorQuery()
              .select('#editor')
              .context(function (res) {
                that.editorCtx = res.context
                that.editorCtx.setContents({
                  delta: content,
                })
              })
              .exec()

            console.log('成功', res)
          })
          .catch((err) => {
            console.log('失败', err)
          })
      })
      .catch((err) => { })

    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({
      isIOS,
    })
    const that = this
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange((res) => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          },
        })
      }, duration)
    })
  },
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const { windowHeight, platform } = wx.getSystemInfoSync()
    let editorHeight =
      keyboardHeight > 0
        ? windowHeight - keyboardHeight - toolbarHeight
        : windowHeight
    this.setData({
      editorHeight,
      keyboardHeight,
    })
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const { statusBarHeight, platform } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  onEditorReady() {
    const that = this
    wx.createSelectorQuery()
      .select('#editor')
      .context(function (res) {
        that.editorCtx = res.context
      })
      .exec()
  },
  blur() {
    this.editorCtx.blur()
  },
  format(e) {
    let { name, value } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)
  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({
      formats,
    })
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      },
    })
  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log('clear success')
      },
    })
  },
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1
      }/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate,
    })
  },
  insertImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      success: function (res) {
        that.editorCtx.insertImage({
          src: res.tempFilePaths[0],
          data: {
            id: 'abcd',
            role: 'god',
          },
          width: '80%',
          success: function () {
            console.log('insert image success')
          },
        })
      },
    })
  },
})
