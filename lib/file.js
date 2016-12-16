
const fs = require('fs')
const Promise = require('bluebird')
const request = require('request')
const unzip = require('unzip-mbcs')

const { FILE } = JSON.parse( fs.readFileSync('config.json') )


module.exports = {
  /**
   * 다운로드 디렉토리를 설정하거나 반환
   * @param  {String}   path  주소
   * @return  {String}
   */
  directory( path ){
    if(path) FILE.DIR = path
    return FILE.DIR
  },


  /**
   * 자막 다운로드
   * @param  {String}   url
   */
  download( url ){
    return new Promise( (resolve, reject) => {

      let filename = 'down.smi'
      if( url.match('CacheFile') ){
        filename = url.match(/name=(.*)/)[1]
      }
      const path = `${ FILE.DIR }/${ filename }`

      request(url)
      .pipe( fs.createWriteStream(path) )
      .on( 'error', function(err) {
        reject(err)
      })
      .on( 'finish', ()=>{
        resolve(filename)
      })

    })
  },


  /**
   * 압축 리스트
   * @param  {String}   filename
   * @return {Array}
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
    fs.unlinkSync( path )
  },

}
