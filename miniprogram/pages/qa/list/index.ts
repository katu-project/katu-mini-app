import { loadData, navigateTo } from '@/utils/index'
import { getAppManager } from '@/controller/app'
const app = getAppManager()
const QaTypeCate = app.getConfig('qaDocType')

Page({
  cate: '',
  data: {
    cate: {},
    list: [],
    isLoading: true
  },

  onLoad(options) {
    this.cate = options.cate || ''
  },

  onReady() {
    const cateData = QaTypeCate.find(e=>e.value === this.cate)
    this.setData({
      cate: cateData
    })
    this.loadData()
  },

  onShow() {
  },

  loadData(){
    loadData(app.getCateDoc, this.cate).then(list=>{
      this.setData({list,isLoading: false})
    })
  },

  tapToDetail(e){
    navigateTo('../detail/index?id='+ e.currentTarget.dataset.key)
  },

  onShareAppMessage() {
    return {
      title: '卡兔使用文档-' + this.data.cate.name
    }
  }
})