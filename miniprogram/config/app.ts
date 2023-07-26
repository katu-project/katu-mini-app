const AppConfig:IAppConfig = {
  contacts:{
    email: 'info@katucloud.com'
  },
  uploadCardType: 'card',
  uploadShareType: 'share',
  uploadUserAvatarType: 'avatar',
  uploadTempFileType: 'temp',
  allowUploadImageType: ['jpeg','png','jpg'],
  cardImageMaxNum: 2,
  devHomeDataCacheTime: 3600,
  homeDataCacheTime: 86400,
  noticeFetchTime: 60,
  tags: [
    { name: '储蓄卡', color:'', layout:'debit_card' },
    { name: '信用卡', color:'', layout:'credit_card' },
    { name: '购物卡', color:'' },
    { name: '名片', color:'' },
    { name: '其他', color:'' }
  ],
  extraFieldsKeys: [
    {
      key: 'cn',
      name: '卡号',
      xid: 1
    },
    {
      key: 'cvv',
      name: '校验码',
      xid: 2
    },
    {
      key: 'cm',
      name: '联系方式',
      xid: 3
    },
    {
      key: 'ed',
      name: '失效日期',
      xid: 4
    },
    {
      key: 'cu',
      name: '自定义',
      xid: 5
    }
  ],
  imageMogr2: '&imageMogr2/thumbnail/100x/rquality/80/format/png/interlace/1/strip',
  doc: {
    userUsageProtocol: 'f6e08a6462b0879e08d6b0a15725ecbb',
    userPrivacyProtocol: '6d85a2b962c283280e7a269719a44f88',
    masterKeyNotice: '0a4ec1f9628b5501063149ac75a21cb7',
    rememberKeyNotice: '0a4ec1f962c4f45f0ea61cd706dd10ca',
    imageProcessorTip_1: '0ab5303b62b975a20b880414327d5628',
    imageProcessorTip_2: '058dfefe62b9720f0ad5eca959e4f456',
    forgetKeyNotice: 'f6e08a64628b55a704a899564e10cf2e',
    dataShareNotice: 'ab3f0baf6385c56b01345fff7aab1830',
    dataSaveSecurityNotice: '6d85a2b9628b54c1063d7b093f152106',
    dataCheckNotice: '534fc1e163b68f2700197d67754d9673',
    tagConflictHelp: '70d5158164b92ed10000777b1d35f76b'
  },
  smsGapTime: 60,
  crypto: {
    defaultCommonCryptoVersion: 'v0',
    useCommonCryptoVersion: 'v0',
    usePackageVersion: 'v0'
  },
  shareInfo: {
    title: '卡兔-安全好用的卡片管理助手',
    path: `/pages/home/index`,
    imageUrl: '/static/share.png'
  },
  cacheClearGapTime: 86400,
  contentCheckHash: 'SHA1'
}

export default AppConfig