import '@/utils/override'
import { getAppManager } from '@/controller/app'
const app = getAppManager()

App({
  onLaunch: function () {
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;  
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
    app.init()
    this.checkUpdate()
  },
  checkUpdate(){
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function({hasUpdate}){
      console.log({hasUpdate})
      if(!hasUpdate) return
      updateManager.onUpdateReady(async ()=>{
        await app.showConfirm('发现新版本，现在更新？')
        updateManager.applyUpdate()
      })
    })
  },
  onUnhandledRejection(e){
    console.log('app onUnhandledRejection: ',e);
  },
  globalData: {
    StatusBar: 0,
    CustomBar: 0,
    Custom: {},
    state: {
      inPreviewPic: false,
      inChooseLocalImage: false,
      inShareData: false
    }
  }
});
