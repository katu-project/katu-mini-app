import Base from "@/class/base"
import { getCpk, getCpkFromFile } from "./pkv/index"
import { bip39, convert, crypto, file } from "@/utils/index"

const ConvertUserKeyError = '密码转化出错'
const CalculateKeyIdError = '获取密码ID出错'
const KatuCryptoFormatter = {
  stringify: function(cipherParams) {
    const KatuMark = [0x9527,0x4396]
    const SaltMark = [0x53616c74, 0x65645f5f]
    const salt = cipherParams.salt
    const ciphertext = cipherParams.ciphertext
    
    const wordArray = crypto.createWordArray(KatuMark)
                      .concat(crypto.createWordArray(SaltMark))
                      .concat(salt)
                      .concat(ciphertext)
    return wordArray.toString(crypto.HexCoding)
  },
  parse: function(encryptedHexString) {
      const KatuMark = [0x9527,0x4396]
      const SaltMark = [0x53616c74, 0x65645f5f]

      const ciphertext = crypto.HexCoding.parse(encryptedHexString)
      const ciphertextWords = ciphertext.words
      if(ciphertextWords[0] !== KatuMark[0] || ciphertextWords[1] !== KatuMark[1]){
          throw Error("ciphertext format error")
      }
      
      // 移除卡兔标志
      ciphertextWords.splice(0,2)
      ciphertext.sigBytes -= 8

      let salt
      if (ciphertextWords[0] == SaltMark[0] && ciphertextWords[1] == SaltMark[1]) {
          // Extract salt
          salt = crypto.createWordArray(ciphertextWords.slice(2, 4));

          // Remove salt from ciphertext
          ciphertextWords.splice(0, 4);
          ciphertext.sigBytes -= 16;
      }

      return crypto.createCipherParams({
          ciphertext,
          salt
      })
  }
}
const CommonCryptoVersionMap = {
  'v0': {
    commonKey: {
      method: 'random',
      length: 16
    },
    calculateKeyId: {
      method: 'SHA1',
      length: 40
    },
    keyConvert: {
      method: 'SHA1',
      length: 40
    }
  }
}

class Crypto extends Base {
  _config = {} as IAppCryptoConfig

  async init(config:IAppCryptoConfig){
    console.debug('使用加密配置:')
    console.table(config)
    this._config = config
  }

  get config(){
    return this._config
  }

  encryptString(text,key){
    return crypto.encryptString(text,key)
  }

  decryptString(ciphertext,key){
    return crypto.decryptString(ciphertext,key)
  }

  encryptText(plaintext:string, key:string, options:any){
    console.debug('encryptFile use config: ', options)
    const cryptoMethod = options.cryptoMethod
    return crypto[cryptoMethod].encrypt(plaintext, key, {
      format: KatuCryptoFormatter
    })
  }

  decryptText(ciphertext:string, key:string, options:any){
    console.debug('decryptFile use config: ', options)
    const cryptoMethod = options.cryptoMethod
    return crypto[cryptoMethod].decrypt(ciphertext, key, {
      format: KatuCryptoFormatter
    })
  }

  async encryptImage({keyPair:{key, salt}, imagePath, extraData, savePath}: IEncryptImageOptions){
    const cpk = getCpk(this.config.usePackageVersion)
    const edh = this.packExtraData(extraData)
    const plaintext = await cpk.cpt(imagePath, edh)
    const encryptedData = this.encryptText(plaintext, key, cpk.dea)
    const encryptedPackage = encryptedData + await cpk.cmd(salt, extraData)
    console.debug(`加密版本: ${cpk.ver}`)
    this.printDebugInfo({key, salt, extraData, edh, plaintext, encryptedData, encryptedPackage})
    await file.writeFile(savePath, encryptedPackage, 'hex')
    return {
      imageSecretKey: salt,
      imagePath: savePath
    }
  }

  async decryptImage({imagePath, savePath, keyPair:{key}}:IDecryptImageOptions){
    const decryptedImage:{savePath: string, extraData: any[]} = {
      savePath,
      extraData: []
    }
    const cpk = await getCpkFromFile(imagePath)

    const encryptedData = await cpk.eed(imagePath)
    const plaintext = await this.decryptText(encryptedData, key, cpk.dea)
    if(!plaintext) throw Error("解密错误")
    const { image, extraData } = await cpk.spt(plaintext, imagePath)
    // 检测并解密附加数据
    try {
      decryptedImage.extraData = this.unpackExtraData(extraData)
    } catch (error) {
      console.error('unpackExtraData err:', error, extraData)
      throw Error("附加数据读取出错")
    }

    console.debug(`解密版本: ${cpk.ver}`)
    this.printDebugInfo({key, image, edh:extraData, extraData:decryptedImage.extraData, plaintext, encryptedData})
    
    await file.writeFile(decryptedImage.savePath, image, 'hex')
    return decryptedImage
  }

  unpackExtraData(edHexData:string): string[][]{
    if(!edHexData) return []
    return JSON.parse(convert.hex2string(edHexData))
  }

  packExtraData(extraData){
    let ed = JSON.stringify(extraData)
    if(ed !== '[]') {
        ed = convert.string2hex(ed)
    }else{
        ed = ''
    }
    console.log('packExtraData',ed,ed.length)
    return ed
  }

  randomHexString(byteLength:number){
    return crypto.random(byteLength)
  }

  createCommonKeyPair(key:string, salt?:string){
    const options = { iterations: 5000 } as Pbkdf2Options
    if(salt){
      options.salt = salt
    }
    return crypto.pbkdf2(key,options)
  }

  convertToHexString(key:string, ccv?: CommonCryptoVersion){
    const {method, length} = CommonCryptoVersionMap[ccv || this.config.useCommonCryptoVersion].keyConvert
    try {
      if(!crypto[method] || typeof crypto[method] !== 'function') throw Error(ConvertUserKeyError)
      const hexCode:string = crypto[method].call(null,key)
      if(!hexCode) throw Error(ConvertUserKeyError)
      return length ? hexCode.slice(0,length) : hexCode
    } catch (error) {
      console.error(error)
      throw Error(ConvertUserKeyError)
    }
  }

  calculateKeyId(key:string, ccv){
    const {method, length} = CommonCryptoVersionMap[ccv].calculateKeyId
    try {
      if(!crypto[method] || typeof crypto[method] !== 'function') throw Error(CalculateKeyIdError)
      const hexCode:string = crypto[method].call(null,key)
      if(!hexCode) throw Error(CalculateKeyIdError)
      return length ? hexCode.slice(0,length) : hexCode
    } catch (error) {
      console.error(error)
      throw Error(CalculateKeyIdError)
    }
  }

  verifyKeyId(key:string, keyPack:IMasterKeyPack, ccv){
    if(this.calculateKeyId(key, ccv) !== keyPack.keyId) throw Error("密码ID未通过验证")
  }

  async createCommonKeyPack(dkey: string, key?: string){
    const ccv = this.config.useCommonCryptoVersion
    if(!key){
      const commonKeyConfig = CommonCryptoVersionMap[ccv].commonKey
      key = await crypto[commonKeyConfig.method].call(null, commonKeyConfig.length) as string
    }
    const keyPack:IMasterKeyPack = {
      keyPack: this.encryptString(key, dkey),
      hexKeyId: this.calculateKeyId(dkey, ccv),
      keyId: this.calculateKeyId(key, ccv),
      ccv
    }
    return keyPack
  }

  async fetchKeyFromKeyPack(keyPack:string, dkey:string){
    const key = this.decryptString(keyPack, dkey)
    if(!key) throw Error("密码有误")
    return key
  }

  generateRecoveryKey(){
    const words = bip39.generateMnemonic()
    return bip39.mnemonicToEntropy(words)
  }

  async createRecoveryKeyContent(){
    const qrId = await this.randomHexString(2)
    return {
      id: qrId.toUpperCase(),
      time: new Date().toLocaleDateString(),
      rk: this.generateRecoveryKey()
    }
  }

  async createRecoveryKeyPack(rkContent, dkey, ccv){
    const keyPack: IRecoveryKeyPack = {
      qrId: rkContent.id,
      createTime: rkContent.time,
      keyId: this.calculateKeyId(rkContent.rk, ccv),
      pack: this.encryptString(dkey, rkContent.rk)
    }
    return keyPack
  }

  async createRecoveryKeyQrCodePack(rkContent){
    const qrPack = {
      i: rkContent.id,
      t: rkContent.time,
      rk: rkContent.rk
    }
    return qrPack
  }

  async createRecoveryKey(masterKey:string, ccv){
    const rkContent = await this.createRecoveryKeyContent()
    const keyPack = await this.createRecoveryKeyPack(rkContent, masterKey, ccv)
    const qrPack = await this.createRecoveryKeyQrCodePack(rkContent)
    return {
      keyPack,
      qrPack
    }
  }

  extractKeyFromRecoveryKeyPack(keyPack, rk){
    const masterKey = this.decryptString(keyPack.pack, rk)
    if(!masterKey) throw Error("密码有误")
    return masterKey
  }

  printDebugInfo(obj){
    console.table({
      ['encrypted Package']: {
        data: '-',
        length: obj.encryptedPackage?.length || '-',
      },
      ['encrypted Data']: {
        data: '-',
        length: obj.encryptedData?.length || '-',
      },
      ['plaintext']: {
        data: '-',
        length: obj.plaintext?.length || '-',
      },
      image: {
        data: '-',
        length: obj.image?.length || '-',
      },
      ['extraData Hex']: {
        data: obj.edh,
        length: obj.edh?.length || '-',
      },
      extraData: {
        data: JSON.stringify(obj.extraData),
        length: obj.extraData?.length || '-',
      },
      salt: {
        data: obj.salt,
        length: obj.salt?.length || '-',
      },
      key: {
        data: obj.key,
        length: obj.key?.length || '-',
      }
    })
  }
}


function getCryptoModule(){
  return Crypto.getInstance<Crypto>()
}

export {
  getCryptoModule
}