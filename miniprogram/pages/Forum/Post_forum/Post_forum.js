const db = wx.cloud.database()
const forum = db.collection('forum')
const fav = db.collection('favorite')
const fileManager = wx.getFileSystemManager()

Page({
  onTransmit: function (event) {
    // console.log('信息', event.detail.userInfo)
    if (this.data.is_post) return
    const that = this
    // 获取编辑器内容
    that.editorCtx.getContents({
      success: (res) => {
        that.data.is_post = true
        let str = JSON.stringify(res.delta)
        var now = new Date().getTime()
        // console.log(res)
        // console.log(str)
        // 在forum中添加记录
        forum
          .add({
            data: {
              publisher_id: this.data.open_id,
              time_publish: now,
              title: this.data.title_val,
              tag: this.data.tag_val,
              content: str,
              likes: 0,
              dislikes: 0,
              likes_id: [],
              dislikes_id: [],
              user_name: this.data.user_name,
              user_image: this.data.user_image
            },
          })
          .then((res) => {
            console.log('发布成功', res)
            this.setData({
              is_post: true
            })
            wx.showToast({
              title: '发布成功',
              icon: 'succes',
            })
            console.log('this.data.open_id', this.data.open_id)
            fav
              .where({
                open_id: this.data.open_id,
              })
              .get()
              .then((result) => {
                console.log('根据openid', result)
                // 因为发布的时候就不可能审查是否是一样的东西
                // 所以, 我只能无脑的把id加进去
                let forum_id = res._id
                let forum_list = result.data[0].forum_list
                forum_list.push(forum_id)

                console.log('forum_list', forum_list)

                fav
                  .where({
                    open_id: this.data.open_id,
                  })
                  .update({
                    data: {
                      forum_list: forum_list,
                    },
                  })
                  .then((res) => {
                    console.log('成功写回', res)
                  })
                  .catch((err) => { })
              })
              .catch((err) => { })
            setTimeout(function () {
              wx.navigateTo({
                url: '../Forum_info/Forum_info',
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
    text_val: '',
    is_post: false,
    // 富文本变量
    formats: {},
    readOnly: false,
    placeholder: '开始输入...',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    // 用户信息
    open_id: '',
    user_image: '',
    user_name: ''
  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly,
    })
  },
  onLoad() {
    // 获取openid
    wx.cloud
      .callFunction({
        name: 'login',
      })
      .then((res) => {
        console.log('成功', res)
        this.setData({
          open_id: res.result.openid,
        })
        // 获取头像和昵称
        fav.where({
          open_id: this.data.open_id
        }).get().then(res => {
          console.log('res', res);
          // data[0]的问题
          console.log('name', res.data[0].userNickName);
          let obj = res.data[0]
          this.setData({
            user_image: obj.userAvatarUrl,
            user_name: obj.userNickName
          })
          console.log('user_image', this.data.user_image);
          console.log('user_name', this.data.user_name);

        })
          .catch(err => {
            console.log('', err);
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
    // this.editorCtx.blur()
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
        let base64 = 'data:image/jpg;base64,' + fileManager.readFileSync(res.tempFilePaths[0],'base64')
        // console.log('上传64',base64)
        that.editorCtx.insertImage({
          src: base64,
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
