const globalData = getApp().globalData
const { loadData, navigateTo } = globalData.utils
const { DefaultShowLockImage, DefaultShowImage } = require('../../const')

Page({
  data: {
    list: [],
    likeList: [],
    notice: {
      newNotice: false,
      content: '暂无新消息'
    },
    isRefresh: false,
    curTab: 0
  },

  onLoad(options) {
  },

  onReady() {
    this.loadData()
  },

  onShow() {
    setTimeout(()=>this.loadNotice(),2000)
    this.getTabBar().setData({selected: 0})
    this.checkDataRefresh()
  },
  async loadData(){
    await this.loadLikeList()
    await this.loadCateList()
  },
  async loadLikeList(){
    // this.setData({
    //   likeList: []
    // })
    let likeList = await loadData(globalData.app.api.getLikeCard)
    likeList = likeList.map(card=>{
      if(card.encrypted){
        card.url = DefaultShowLockImage
      }else{
        card.url = DefaultShowImage
      }
      return card
    })
    this.setData({
      likeList
    })
    this.loadImage()
  },
  loadImage(){
    for (const idx in this.data.likeList) {
      const card = this.data.likeList[idx]
      if(!card.encrypted){
        wx.cloud.getTempFileURL({
          fileList: [{
            fileID: card.image[0].url
          }]
        }).then(({fileList:[file]})=>{
          const key = `likeList[${idx}].url`
          this.setData({
            [key]: file.tempFileURL + globalData.app.Config.imageMogr2
          })
        })
      }
    }
  },
  async loadCateList(){
    // this.setData({
    //   list: []
    // })
    const list = await loadData(globalData.app.api.getCardSummary)
    this.setData({
      list
    })
  },
  checkDataRefresh(){
    if(this.backData && this.backData.refresh){
      this.loadData()
      this.backData.refresh = null
      console.log("刷新数据");
    }
  },
  async loadNotice(){
    return globalData.app.api.getNotice().then(notice=>{
      if(!notice) return 
      this.setData({
        'notice.id': notice._id,
        'notice.time': new Date(notice.updateTime).toLocaleDateString(),
        'notice.newNotice': true,
        'notice.content': notice.content
      })
      if(notice.auto_show){
        this.tapToShowNotice()
      }
    }).catch(console.warn)
  },
  tapToMarkRead(){
    if(!this.data.notice.id) {
      return this.hideModal('showNotice')
    }
    globalData.app.api.markRead(this.data.notice.id)
    this.setData({
      'notice.newNotice': false
    })
    this.hideModal('showNotice')
  },
  tapToHideModal(e){
    this.hideModal(e.currentTarget.dataset.name)
  },
  tapToSearch(){
    navigateTo('../card/list/index', true)
  },
  tapToShowNotice(){
    const data = {showNotice: true}
    this.setData(data)
  },
  tapToCardList(e){
    navigateTo('../card/list/index?tag='+e.currentTarget.dataset.tag, true)
  },
  tapToCardDetail(e){
    navigateTo(`/pages/card/detail/index?id=${e.currentTarget.dataset.item._id}`)
  },
  onBindRefresh(e){
    const key = e.currentTarget.dataset.view
    if(key === 'Like'){
      this.loadLikeList().then(()=>{
        this.setData({
          isRefresh: false
        })
      })
    }else{
      this.loadData().then(()=>{
        this.setData({
          isRefresh: false
        })
      })
    }
    
  },
  onBindscrolltoupper(){
    if(this.data.curTab !== 0){
      this.setData({
        curTab: 0
      })
    }
  },
  onBindscrolltolower(){
    if(this.data.curTab !== 1){
      this.setData({
        curTab: 1
      })
    }
  },
  onShareAppMessage(){
    return {
      title: '卡兔-安全好用的卡片管理助手',
      path: '/pages/home/index',
      imageUrl: '../../static/share.png'
    }
  },
  hideModal(name){
    this.setData({
      [name]: false
    })
  }
})