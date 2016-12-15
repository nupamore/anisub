
const fs = require('fs')
const request = require('request')
const unzip = require('unzip-mbcs')

const { FILE } = JSON.parse( fs.readFileSync('config.json') )


module.exports = {
  /**
   * 다운로드 디렉토리 설정
   * @param  {String}   path  주소
   * @param  {Function} cb
   */
  setDirectory( path ){
    FILE.DIR = path
  },


  /**
   * 자막 다운로드
   * @param  {String}   url
   * @param  {Function} cb
   */
  download( url, cb ){
    // 캐시 url
    if( url.match('CacheFile') ){
      const filename = url.match(/name=(.*)/)[1]
      const path = `${ FILE.DIR }/${ filename }`

      request(url)
      .pipe( fs.createWriteStream(path) )
      .on( 'finish', ()=>{
        cb(filename)
      })
    }
  },


  /**
   * 압축 리스트
   * @param  {String}   filename
   * @return {Array}    list
   */
  listZip( filename ){
    const path = `${ FILE.DIR }/${ filename }`

    const list = unzip.listSync( path, 'cp949' )
    return list
  },


  /**
   * 압축 해제
   * @param  {String}   filename
   * @param  {String}   subname     꺼낼 파일이름
   * @param  {String}   targetname  저장 될 파일이름
   */
  unZip( filename, subname, targetname ){
    const path = `${ FILE.DIR }/${ filename }`

    unzip.extractSync( path, 'cp949', [subname] )
    fs.renameSync( subname, `${ FILE.DIR }/${ targetname }`)
    fs.unlinkSync(path)
  },

}
