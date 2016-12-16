
const Promise = require('bluebird')

const parser = require('./lib/parser.js')
const file = require('./lib/file.js')

const anisub = {
  parser,
  file,

  /**
   * 최신화 체크
   * @param  {Regex}  keyword 검색어
   * @param  {Regex}  user    자막제작자
   * @return {Promise}
   */
  check( keyword, user ){
    return new Promise( (resolve, reject) => {

      parser.anime( keyword )
      .bind( b = {} )

      // 애니메이션 선택
      .then( list => {
        b.ani = list[0]
        if(!b.ani) reject( new Error('애니메이션을 찾을 수 없습니다') )

        console.log(`애니메이션: ${b.ani.s}`)
        return parser.subtitle(b.ani.i)
      })

      // 자막제작자 선택
      .then( list => {
        b.subtitle = list.filter( u => u.n.match(user) )[0] || list[0]
        if(!b.subtitle) reject( new Error('자막을 찾을 수 없습니다') )

        console.log(`자막제작자: ${b.subtitle.n}`)
        console.log(`에피소드: ${b.subtitle.s}화\n`)
        resolve(b)
      })

      .catch( err => reject(err) )
    })
  },


  /**
   * 자막 다운로드
   * @param  {Object}  checked 체크결과
   * @param  {Regex}   filter  필터
   * @return {Promise}
   */
  down( checked, filter ){
    const { ani, subtitle } = checked
    return new Promise( (resolve, reject) => {

      parser.cache( ani.i, subtitle.b )
      .then( json => {
        if(!json) reject( new Error('캐시를 찾을 수 없습니다') )

        const ep = json.find( ep => (ep.s+'').match(subtitle.s) )
        const files = ep.file.filter( file => {
          console.log( file )
          return file.match(filter)
        })
        console.log()

        files.forEach( file => {
          console.log( `다운로드: ${file}` )
        })
      })

      .catch( err => reject(err) )
    })
  },

}

module.exports = anisub

anisub.check('애니이름', '자막제작자')
.then( result => anisub.down(result, '.zip') )
.catch( err => console.log(err) )
