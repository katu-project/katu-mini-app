interface String {
  replaceAll(pattern: any, replacement: string) : string;
}

declare namespace WechatMiniprogram {
  interface Console {
    time: (title:string)=>unknown
    timeEnd: (title:string)=>unknown

    _log: (...args) => void
    _warn: (...args) => void
    _debug: (...args) => void
    _error: (...args) => void
  }
}

interface IAnyObject {
  [key:string]: any
}