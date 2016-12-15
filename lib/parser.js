
const fs = require('fs')
const request = require('request')
const htmlparser = require('htmlparser2')

const { URL } = JSON.parse( fs.readFileSync('config.json') )


function parseJson( url, cb ){
  request.get( url, (err, res, body) => {
    const list = JSON.parse(body)
    cb(err, list)
  })
}

function parseHtml( url, cb ){
  request.get( url, (err, res, body) => {
    cb(err, body)
  })
}


module.exports = {
  /**
   * 애니메이션 찾기
   * @param  {String}   keyword
   * @param  {Function} cb
   */
  getAnimeList( keyword, cb ){
    const url = URL.OHLI.ANI.NOW

    parseJson( url, (err, list) => {
      if( err ){
        cb(err)
        return
      }

      const result = []
      list.forEach( day => {
        const works = day.filter( work => {
          if( work.s.match(keyword) )
            return true
          // 별칭
          if( work.n.filter(n => n.s.match(keyword)).length ){
            return true
          }
        })
        if( works.length ) result.push(...works)
      })
      cb(null, result)
    })
  },


  /**
   * 자막제작자 찾기
   * @param  {Number}   aniId
   * @param  {Function} cb
   */
  getCaptionList( aniId, cb ){
    const url = URL.OHLI.CAPTION.replace('<ani>', aniId)
    parseJson( url, cb )
  },


  /**
   * 캐시 조회
   * @param  {Number}   userId
   * @param  {Number}   aniId
   * @param  {Function} cb
   */
  getCache( userId, aniId, cb ){
    const url = URL.OHLI.CACHE
      .replace('<blog>', userId)
      .replace('<ani>', aniId)

    parseHtml( url, (err, body) => {
      if( err ){
        cb(err)
        return
      }

      const sw = {
        ep: false,
        file: false
      }
      const files = []
      let count = 0

      const parser = new htmlparser.Parser({
        onopentag(name, attribs){
          if( name == "a" ){
            // 제목 넘어가기
            if( count < 2 ){
              count++
            }
            // 에피소드
            else if( attribs.href.match('http') ){
              sw.ep = true
              files.push({
                t: '',
                a: attribs.href,
                s: 0,
                file: [],
              })
            }
            // 파일
            else if( attribs.href.match('File') ){
              const last = files[files.length-1]
              last.file.push( URL.OHLI.SITE+attribs.href )
            }
          }
        },
        ontext(text){
          if( sw.ep ){
            const last = files[files.length-1]
            last.t = text
            last.s = text.match(/([0-9.]+)화/)[1]*1
          }
        },
        onclosetag(name){
          if( name == "a" && sw.ep == true ){
            sw.ep = false
          }
        }
      }, {decodeEntities: true})
      parser.write(body)
      parser.end()

      cb(null, files)
    })
  },
}
