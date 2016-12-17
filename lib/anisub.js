
const Promise = require('bluebird')
const chalk = require('chalk')

const parser = require('./parser.js')
const file = require('./file.js')


/**
 * API
 */
const anisub = {
  parser,
  file,

  /**
   * 최신화 체크
   * @param  {Regex}  keyword 검색어
   * @param  {Regex}  user    자막제작자
   * @return {Promise}
   */
  now( keyword, user ){
    return new Promise( (resolve, reject) => {

      anisub.parser.anime( keyword )
      .bind( b = {} )

      /**
       *  애니메이션 선택
       */
      .then( list => {
        b.ani = list[0]
        if(!b.ani) reject( new Error('애니메이션을 찾을 수 없습니다') )

        console.log(`\n애니메이션: ${b.ani.s}`)
        return anisub.parser.subtitle(b.ani.i)
      })

      /**
       *  자막제작자 선택
       */
      .then( list => {
        console.log( '\n자막제작자 찾는중..' )

        let finded = 0
        b.subtitle = list.filter( u => {
          // 필터가 없을 경우
          if( !user && !finded++ ){
            console.log( chalk.green(u.n) )
            return u
          }
          else if( user && u.n.match(user) && !finded++ ){
            console.log( chalk.green(u.n) )
            return u
          }
          else{
            console.log( chalk.blue(u.n) )
          }
        })[0]

        if(!b.subtitle) reject( new Error('자막을 찾을 수 없습니다') )

        console.log(`\n에피소드: ${b.subtitle.s*0.1}화`)
        console.log(`주소: ${b.subtitle.a}`)
        resolve(b)
      })

      .catch( err => reject(err) )
    })
  },


  /**
   * 자막 다운로드
   * @param  {Object}  checked    체크결과
   * @param  {Regex}   filter     필터
   * @param  {String}  savename   자막파일 이름 설정
   * @return {Promise}
   */
  down( checked, filter, savename ){
    const { ani, subtitle } = checked
    if( !Array.isArray(filter) ){
      filter = [filter, filter]
    }
    else if( !filter[1] ){
      filter[1] = filter[0]
    }

    return new Promise( (resolve, reject) => {
      anisub.parser.post( subtitle.a )
      .then( list => {
        if(!list.length) reject( new Error('다운로드 링크를 찾을 수 없습니다') )

        console.log( '\n다운로드 링크 찾는중..' )

        /**
         *  파일 선택
         */
        let finded = 0
        const file = list.filter( file => {
          // 필터가 없을 경우
          if( !filter[0] && !finded++ ){
            console.log( chalk.green(file.name) )
            return file
          }
          else if( filter[0] && file.name.match(filter[0]) && !finded++ ){
            console.log( chalk.green(file.name) )
            return file
          }
          else{
            console.log( chalk.blue(file.name) )
          }
        })[0]

        /**
         *  압축을 풀 파일 선택
         */
        if( !file.name.match('.zip') ){
          resolve([file])
        }
        else{
          anisub.file.download(file.src)
          .then( zipname => {
            console.log( '\n압축 푸는중..' )
            const list = anisub.file.listZip(zipname)

            let finded = 0
            const files = list.reduce( (p,n) => p.concat(n.path), [] )
            .filter( file => {
              // 필터가 없을 경우
              if( !filter[1] && !finded++ ){
                console.log( chalk.green(file) )
                return file
              }
              else if( filter[1] && file.match(filter[1]) ){
                console.log( chalk.green(file) )
                return file
              }
              else{
                console.log( chalk.blue(file) )
              }
            })

            files.forEach( file => {
              anisub.file.unZip( zipname, file )
            })
            anisub.file.unlinkSync( zipname )
            resolve(files)
          })
        }
      })

      .catch( err => reject(err) )
    })
  },

}

module.exports = anisub
