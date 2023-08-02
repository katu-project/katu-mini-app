import { loadData } from '@/utils/index'
import { getAppManager } from '@/controller/app'
import { getUserManager } from '@/controller/user'
const app = getAppManager()
const user = getUserManager()

Page({
  data: {
    user: {} as Partial<IUser>,
    activeInfo: {},
    menus: app.menu.profile,
    DefaultUserAvatar: app.getConst('DefaultUserAvatar')
  },

  onLoad() {
    app.on('userChange',this.onEventUserChange)
    this.loadUserInfo()
  },

  onReady() {
  },

  onShow() {
    this.getTabBar().setData({selected: 2})
    if(getApp().globalData.showActive){
      getApp().globalData.showActive = false
      this.showActiveInfo()
    }
  },

  tapUser(){
    if(user.isActive) {
      return this.tapToEditInfo()
    }
    return this.showActiveInfo()
  },
  
  async tapToActiveAccount(){
    await loadData(user.activeAccount, {}, '正在激活账号')
    app.showNotice("激活成功")
    this.reloadUserInfo()
    this.hideActiveNotice()
  },

  loadUserInfo(){
    this.setData({
      user: {
        nickName: user.nickName,
        avatarUrl: user.avatar,
        isActive: user.isActive,
        identifyCode: user.uid
      }
    })
  },

  reloadUserInfo(){
    user.reloadInfo().then(()=>{
      this.loadUserInfo()
    })
  },

  tapToEditInfo(){
    if(!user.isActive) return
    app.goProfileEditPage()
  },

  onEventUserChange(){
    console.log('onEventUserChange')
    this.setData({
      'user.avatarUrl': app.getConst('DefaultUserAvatar')
    })
    this.reloadUserInfo()
  },

  async tapToItem(e){
    const item = e.currentTarget.dataset.item
    if(item.needActive && !user.isActive){
      await app.showActiveNotice(false)
      return this.showActiveInfo()
    }
    return app.goToPage(item.url)
  },

  tapToReadDoc(e){
    app.navToDocPage(e.currentTarget.dataset.item.id)
  },

  async showActiveInfo(){
    await this.loadActiveData()
    this.setData({
      showActiveInfo: true
    })
  },

  hideActiveNotice(){
    this.setData({
      showActiveInfo: false
    })
  },
  
  async loadActiveData(){
    if(this.data.activeInfo.id) return
    const { activeInfo, content } = await loadData(app.getActiveInfo)
    this.setData({
      activeInfo,
      'activeInfo.notice': content
    })
  }
})