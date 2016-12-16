
const parser = require('./lib/parser.js')
const file = require('./lib/file.js')

/*
const temp = function temp( ...params ){
  if( typeof params[0] == 'object' ){
    var {keyword, user, ep, filter = false} = params[0]
  }
  else{
    var [keyword, user, ep, filter = false] = params
  }

  async.waterfall([
    // 작품 검색
    cb => parser.getAnimeList( keyword, (err, result) => {
      // 에러
      if( err ){
        cb(err)
      }
      // 작품이 하나가 아닌 경우
      else if( result.length != 1){
        cb( new Error(`검색된 작품이 하나가 아닙니다. (length:${result.length})`) )
      }
      // 정상
      else{
        cb(null, result[0].i)
      }
    }),

    // 자막제작자 검색
    (aniId, cb) => parser.getCaptionList( aniId, (err, result) => {
      // 에러
      if( err ){
        cb(err)
      }
      // 정상
      else{
        const users = result.filter( u => u.n.match(user) )
        // 한 명이 아닌 경우
        if( users.length != 1){
          cb( new Error(`검색된 자막제작자가 한 명이 아닙니다. (length:${users.length})`) )
        }
        // 정상
        else{
          cb(null, users[0].b, aniId)
        }
      }
    }),

    // 캐시 검색
    (userId, aniId, cb) => parser.getCache( userId, aniId, (err, result) => {
      // 에러
      if( err ){
        cb(err)
      }
      else if( !result ){
        cb( new Error(`캐시를 찾을 수 없습니다. (length:${result.length})`) )
      }
      // 정상
      else{
        const eps = {
          // ep가 생략되었을 경우 최신화로 간주
          undefined: [result[0]],
          // 숫자일 경우 정확히 비교
          number: result.filter( e => e.s == ep ),
          // 문자일 경우 느슨한 비교
          string: result.filter( e => (e.s+'').match(ep) ),
        }[ typeof ep ]

        const files = eps.map( e => e.file.filter(f => !f.match(filter))[0] )

        cb(null, files)
      }
    }),
  ],
  (err, result) => {
    if(err) console.log(err)
    console.log(result)
  })
}
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
  check( keyword, user ){

    return new Promise( (resolve, reject) => {
      parser.anime( keyword )
      // 애니메이션 선택
      .then( list => {
        const ani = list[0]
        if(!ani) reject( new Error('애니메이션을 찾을 수 없습니다') )

        this.aniId = ani.i
        console.log(`애니메이션: ${ani.s}`)
        return parser.subtitle(this.aniId)
      })
      // 자막제작자 선택
      .then( list => {
        const u = list.filter( u => u.n.match(user) )[0] || list[0]
        if(!u) reject( new Error('자막을 찾을 수 없습니다') )

        this.userId = u.b
        console.log(`자막제작자: ${u.n}`)
        console.log(`에피소드: ${u.s}화`)
        resolve( u.s )
      })
      .catch( err => reject(err) )
    })
  },

}

module.exports = anisub

anisub.check('애니제목', '자막제작자')
.then( ep => console.log(ep) )
.catch( err => console.log(err) )
