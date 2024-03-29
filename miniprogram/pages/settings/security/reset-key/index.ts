import { getAppManager } from '@/controller/app'
import { getUserManager } from "@/controller/user"
const app = getAppManager()
const user = getUserManager()

Page({
  data: {
    setRecoveryKey: false
  },
  
  onShow() {
    const setData = {
      setRecoveryKey: false
    }
    if(user.config?.security.setRecoveryKey){
      setData.setRecoveryKey = user.config.security.setRecoveryKey
    }
    this.setData(setData)
  },

  tapToPage({currentTarget:{dataset:{idx}}}){
    if(idx==1){
      app.goResetKeyByQrcodePage()
    }
  },

  tapToDoc(){
    app.openForgetKeyNotice()
  }
})