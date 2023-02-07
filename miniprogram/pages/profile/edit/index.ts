import { loadData, showError, showSuccess, showNotice, navigateBack } from '@/utils/index'
import { getUserManager } from '@/class/user'
import api from '@/api'
const user = getUserManager()

Page({
  originData: {} as {name:string, url:string},
  data: {
    url: '/static/images/user.svg',
    name: ''
  },
  onLoad() {
  },
  onReady() {
    this.setData({
      url: user.baseInfo.avatarUrl,
      name: user.baseInfo.nickName
    })
    this.originData = Object.assign({},this.data)
  },
  onShow(){
  },
  nameInput(e){
    const setData = {
      name: e.detail.value.trim()
    }
    if(setData.name !== this.originData.name){
      setData['dataChange'] = true
    }else{
      setData['dataChange'] = false
    }
    this.setData(setData)
  },
  onBindChooseAvatar(e){
    this.setData({
      url: e.detail.avatarUrl,
      dataChange: true
    })
  },
  async tapToSaveUserInfo(){
    const nickName = this.data.name
    if(nickName === this.originData.name && this.data.url == this.originData.url) {
      showNotice('数据无变动!')
      return
    }
    const userData = {}

    if(nickName !== this.originData.name){
      if(nickName.length>8){
        showError("昵称长度有误")
        return 
      }
      userData['name'] = nickName
    }
    
    if(this.data.url && !this.data.url.startsWith('https') && !this.data.url.startsWith('cloud:')){
      const url = await loadData(user.uploadAvatar, this.data.url, '正在上传头像')
      userData['url'] = url
    }
    
    loadData(api.updateUserProfile, userData, '正在保存信息').then(()=>{
      user.emit('userChange')
      showSuccess('修改成功').then(()=>{
        setTimeout(()=>{
          navigateBack()
        },500)
      })
    })
  }
})