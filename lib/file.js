
const fs = require('fs')
const Promise = require('bluebird')
const request = require('request')
const unzip = require('unzip-mbcs')

const { FILE } = JSON.parse( fs.readFileSync(`${__dirname}/../config.json`) )


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
   * 파일 다운로드
   * @param  {String}   url
   * @param  {String}   filename
   * @return {Promise}
   */
  download( url, filename ){
    const arr = url.split('/')
    filename = filename || arr[arr.length-1].replace(/\?.*/, '')

    const path = `${ FILE.DIR }/${ filename }`

    return new Promise( (resolve, reject) => {
      request({
        url,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
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
   * @param  {String}   zipname     압축파일이름
   * @param  {String}   filename    꺼낼 파일이름
   */
  unZip( zipname, filename ){
    const path = `${ FILE.DIR }/${ zipname }`

    unzip.extractSync( path, 'cp949', [filename] )
    fs.renameSync( filename, `${ FILE.DIR }/${ filename }`)
  },


  /**
   * 파일 삭제
   * @param  {String}   filename
   */
  unlinkSync( filename ){
    const path = `${ FILE.DIR }/${ filename }`
    fs.unlinkSync( path )
  },

}
