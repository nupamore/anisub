
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
   * @param  {Regex}  end     종영
   * @return {Promise}
   */
  now( keyword, user, end ){
    return new Promise( (resolve, reject) => {

      anisub.parser.anime( keyword, end )
      .bind( b = {} )

      /**
       *  애니메이션 선택
       */
      .then( list => {
        b.ani = list[0]

        console.log(`\n애니메이션: ${b.ani.s}`)
        return anisub.parser.subtitle(b.ani.api, b.ani.i)
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
            console.log( chalk.cyan(u.n) )
            return u
          }
          else if( user && u.n.match(user) && !finded++ ){
            console.log( chalk.cyan(u.n) )
            return u
          }
          else{
            console.log( chalk.gray(u.n) )
          }
        })[0]

        console.log(`\n에피소드: ${b.subtitle.s}화`)
        resolve(b)
      })

      .catch( err => reject(err) )
    })
  },


  /**
   * 종영 애니 검색
   * @param  {Regex}  keyword 검색어
   * @param  {Regex}  user    자막제작자
   * @return {Promise}
   */
  end( keyword, user ){
    return anisub.now(keyword, user, true)
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
        console.log( '\n다운로드 링크 찾는중..' )

        /**
         *  파일 선택
         */
        let finded = 0
        const file = list.filter( file => {
          // 필터가 없을 경우
          if( !filter[0] && !finded++ ){
            console.log( chalk.cyan(file.name) )
            return file
          }
          else if( filter[0] && file.name.match(filter[0]) && !finded++ ){
            console.log( chalk.cyan(file.name) )
            return file
          }
          else{
            console.log( chalk.gray(file.name) )
          }
        })[0]

        /**
         *  압축을 풀 파일 선택
         */
        anisub.file.download(file.src)
        .then( zipname => {
          // 압축파일이 아닌 경우
          if( !zipname.match('.zip') ){
            resolve([file])
          }
          // 압축파일인 경우
          else{
            console.log( '\n압축 푸는중..' )
            const list = anisub.file.listZip(zipname)

            let finded = 0
            const files = list.reduce( (p,n) => p.concat(n.path), [] )
            .filter( file => {
              // 필터가 없을 경우
              if( !filter[1] && !finded++ ){
                console.log( chalk.cyan(file) )
                return file
              }
              else if( filter[1] && file.match(filter[1]) ){
                console.log( chalk.cyan(file) )
                return file
              }
              else{
                console.log( chalk.gray(file) )
              }
            })

            files.forEach( file => {
              anisub.file.unZip( zipname, file )
            })
            anisub.file.unlinkSync( zipname )
            resolve(files)
          }
        })

      })

      .catch( err => reject(err) )
    })
  },

}

module.exports = anisub
