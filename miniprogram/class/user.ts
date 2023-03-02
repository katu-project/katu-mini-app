import api from "@/api"
import utils from "@/utils/index"
import Base from "./base"
import { getAppManager } from "@/class/app";

export default class User extends Base {
  _user: Partial<IUser> = {}
  _customTags: ICardTag[] = []

  constructor(){
    super()
  }

  async init(){
    await this.loadInfo()
    if(this.isSetMasterKey && this.config?.security.rememberPassword){
      console.log("启用记住密码: 加载主密码");
      getAppManager().loadMasterKey()
    }
    wx.nextTick(()=>{
      setTimeout(() => {
        this.loadCustomTags()
      }, 3000);
    })
    this.loadOnAppHideConfig()
  }

  get config(){
    return this.user.config
  }

  get quota(){
    return this.user.quota?.remain || 0
  }

  get tags(){
    return this._customTags
  }

  get isActive():boolean{
    return this.user.isActive!
  }

  get isSetMasterKey():boolean{
    return this.user.setMasterKey || false
  }

  get masterKeyPack(){
    return this.masterKeyPack
  }

  get recoveryKeyPack(){
    return this.user.recoveryKeyPack
  }

  get nickName(){
    return this.user.nickName
  }

  get avatar(){
    return this.user.avatarUrl
  }

  get openid(){
    return this.user.openid
  }

  get id(){
    return this.user.identifyCode
  }

  get tel(){
    return this.user.contact?.tel
  }

  get email(){
    return this.user.contact?.email
  }

  get user(){
    return this._user
  }

  async loadInfo(){
    this._user = await api.getUser()
  }

  async reloadInfo(){
    return this.loadInfo()
  }

  async clearInfo(){
    return this.reloadInfo() // 获取默认用户数据
  }

  async checkQuota(){
    if(this.quota < 0){
      throw Error('兔币余额不足')
    }
  }

  async getQuotaLog(params){
    return api.getUserQuotaLog(params)
  }

  async getQuotaLogDetail(params){
    return api.getUserQuotaLogDetail(params)
  }

  async quotaExchange(data){
    return api.quotaExchange(data)
  }

  async loadCustomTags(){
    this._customTags = await api.getUserTag()
  }

  async applyConfig(configItem:{key:string,value:string}){
    try {
      await api.updateUserConfig(configItem)
      return utils.objectSetValue(this.user, configItem.key, configItem.value)
    } catch (error) {
      console.warn('applyConfig:',error.message)
      await this.reloadInfo()
      throw new Error("修改失败")
    }
  }

  async bindTelNumber(data){
    return api.bindTelNumber(data)
  }

  async removeBindTelNumber(data){
    return api.removeBindTelNumber(data)
  }

  async getTags(){
    return api.getUserTag()
  }

  async deleteTag(_id: string){
    return api.deleteTag({_id})
  }

  async createTag(tag: Pick<ICardTag,'name'>){
    const checkText = tag.name
    const {checkPass} = await getAppManager().textContentsafetyCheck(checkText)
    if(!checkPass){
      throw new Error("数据似乎存在不适内容")
    }
    return api.createTag(tag.name)
  }

  async updateTag(tag: Pick<ICardTag,'color'|'_id'>){
    return api.updateTag(tag)
  }

  async uploadAvatar(filePath){
    const s = new Date().getTime()
    return api.uploadAvatar(filePath, `user/${this.openid}/avatar/${s}`)
  }

  loadOnAppHideConfig(){
    wx.onAppHide(res=>{
      const globalState = getApp().globalData.state
      console.log('onAppHide:', res, globalState);
          // 暂时解决图片预览引起的清除主密码的bug
      if(globalState.inPreviewPic){
        globalState.inPreviewPic = false
        return
      }else if(globalState.inChooseLocalImage){
        globalState.inChooseLocalImage = false
        return
      }else if(globalState.inShareData){
        globalState.inShareData = false
        return
      }

      if(this.config?.security.rememberPassword){
        console.log('缓存主密码');
        getAppManager().cacheMasterKey()
      }else{
        if(this.config?.security.lockOnExit){
          console.log('退出并清除主密码');
          getAppManager().clearMasterKey()
        }
      }
    })
  }

  async activeAccount(){
    return api.activeAccount({})
  }
}


function getUserManager(){
  return User.getInstance<User>()
}

export {
  getUserManager
}