import { loadData } from '@/utils/index'
import { getCardManager } from '@/controller/card'
import { getAppManager } from '@/controller/app'
const app = getAppManager()
const cardManager = getCardManager()

Page({
  originImagePath: '',
  data: {
    selectedMethod: 0,
    tmpImagePath: ''
  },

  onLoad(options) {
    this.setData({
      tmpImagePath: app.getConst('DefaultShowImage')
    })
    if(options.value){
      this.originImagePath = options.value
    }else{
      app.navigateBack()
    }
  },

  onReady() {
    this.setData({
      tmpImagePath: this.originImagePath
    })
  },

  async tapToSelectImage(){
    try {
      const picPath = await app.chooseLocalImage()
      if(!picPath) return
      this.setData({
        tmpImagePath: picPath
      })
      this.originImagePath = picPath
    } catch (error:any) {
      app.showNotice(error.message)
    }
  },

  async useAndBack() {
    await app.knowContentCheck()
    await loadData(app.imageContentCheck,{imagePath:this.data.tmpImagePath},'内容合规检查')
    app.emit('setCardImage',this.data.tmpImagePath)
    app.navigateBack()
  },

  async selectMethod(e){
    return this.processImage(parseInt(e.detail.value))
  },

  async processImage(idx){
    const imageUrl = this.originImagePath
    switch (idx) {
      case 1:
        this.useInternalApi(imageUrl)
        break
      case 2:
        this.useRemoteApi(imageUrl)
        break
      case 3:
        this.useWxEditor(imageUrl)
        break
      case 0:
      default:
        this.useOriginImage(imageUrl)
    }
  },

  async useOriginImage(src){
    this.setData({
      'tmpImagePath': src
    })
  },

  async useInternalApi(src){
    const imageUrl = await loadData(cardManager.parseCardImageByInternalApi, src, {returnFailed: true}).catch(error=>{
      this.findCardFailed(error)
    })
    if(imageUrl) {
      this.setData({
        'tmpImagePath': imageUrl
      })
    }
  },

  async useRemoteApi(src){
    const confirm = await this.showRemoteApiNotice()
    if(!confirm){
      return
    }
    const imageUrl = await loadData(cardManager.parseCardImageByRemoteApi, src ,{returnFailed: true}).catch(error=>{
      this.findCardFailed(error)
    })
    if(imageUrl){
      this.setData({
        'tmpImagePath': imageUrl
      })
    }
  },

  async useWxEditor(src){
    try {
      const tempFilePath = await app.editImage(src)
      this.setData({
        'tmpImagePath': tempFilePath
      })
    } catch (error) {
      this.findCardFailed(error)
    }
  },

  findCardFailed(error){
    if(error) {
      console.error(error)
      app.showNotice(error.message)
    }
    this.setData({
      selectedMethod: 0
    })
  },

  async tapToShowInternalApiNotice(){
    await app.showConfirm('这些小技巧能提高卡片识别率！', '去查看')
    app.openInternalApiNotice()
  },

  async showRemoteApiNotice(){
    const {confirm, cancel} = await app.showChoose("外部接口由第三方提供!\n敏感数据请谨慎使用。",{showCancel:true, cancelText: '去查看'})
    if(cancel) {
      app.openRemoteApiNotice()
      this.setData({
        selectedMethod: 0
      })
    }
    return confirm
  },

  tapToShowRemoteApiNotice(){
    this.showRemoteApiNotice()
  }
})