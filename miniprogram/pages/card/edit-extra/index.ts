import { navigateBack } from '@/utils/index'
import { getAppManager } from '@/class/app'
const app = getAppManager()

Page({
  returnContentKey: '',
  data: {
    extra_fields_keys: app.Config.extraFieldsKeys,
    extra_fields: [] as ICardExtraField[],
    dataChange: false
  },
  onLoad(options) {
    this.returnContentKey = options.returnContentKey || 'tempData'
    if(options.value){
      let labels = this.data.extra_fields_keys
      const extra_fields = JSON.parse(options.value).map(item=>{
        labels = labels.filter(e=>e.key !== item[0])
        const label = Object.assign({},this.data.extra_fields_keys.find(e=>e.key == item[0]))
        label.value = item[1]
        return label
      })
      this.setData({
        labels,
        extra_fields
      })
    }
  },
  onBindinput({currentTarget:{dataset: {idx}}, detail: {value}}){
    const key = `extra_fields[${idx}].value`
    this.setData({
      dataChange: value ? true : false,
      [key]: value
    })
  },
  onBindchange(e){
    const idx = parseInt(e.detail.value)
    if(!this.data.extra_fields_keys[idx]) return
    if(this.data.extra_fields_keys[idx].key === 'custom') {
      // const customLabel = Object.assign({},this.data.labels[idx])
      // const cid = this.data.extra_fields.filter(e=>e.key.startsWith('custom_')).length + 1
      // customLabel.name = `自定义_${cid}`
      // customLabel.key = `custom_${cid}`
      // const extra_fields = this.data.extra_fields.concat(customLabel)
      // this.setData({
      //   extra_fields
      // })
      return
    }

    const extra_fields = this.data.extra_fields.concat(this.data.extra_fields_keys[idx]).sort((a,b)=> a.xid-b.xid)
    const labels = this.data.extra_fields_keys.filter((_,i)=> i !== idx)
    
    this.setData({
      labels,
      extra_fields
    })
  },
  tapToRemoveLabel(e){
    const key = e.currentTarget.dataset.key
    if(key.startsWith('custom_')){
      return
    }

    const extra_fields = this.data.extra_fields.filter((e)=> e.key !== key)
    const labels = this.data.extra_fields_keys.concat(app.Config.extraFieldsKeys.find(e=>e.key === key)!).sort((a,b)=> a.xid-b.xid)

    this.setData({
      dataChange: extra_fields.length > 0,
      labels,
      extra_fields
    })
  },
  tapToSave(){
    const miniData = JSON.stringify(this.data.extra_fields.map(e=>([e.key,e.value])))
    navigateBack({backData: {[this.returnContentKey]: miniData}})
  }
})