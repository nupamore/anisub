
const fs = require('fs')
const Promise = require('bluebird')
const request = require('request-promise')
const htmlparser = require('htmlparser2')

const { URL } = JSON.parse( fs.readFileSync('config.json') )


function parseJson( url ){
  return new Promise( (resolve, reject) => {
    request.get( url )
    .catch( err => reject(err) )
    .then( body => {
      const list = JSON.parse(body)
      resolve(list)
    })
  })
}

function parseHtml( url ){
  return request.get( url )
}

function parseCache( body ){
  const eps = []
  const sw = {
    ep: false,
    file: false
  }
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
          eps.push({
            t: '',
            a: attribs.href,
            s: 0,
            file: [],
          })
        }
        // 파일
        else if( attribs.href.match('File') ){
          const last = eps[eps.length-1]
          last.file.push( URL.OHLI.SITE+attribs.href )
        }
      }
    },
    ontext(text){
      if( sw.ep ){
        const last = eps[eps.length-1]
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
  return eps
}


module.exports = {
  /**
   * 애니메이션 찾기
   * @param  {String}   keyword
   */
  anime( keyword ){
    const url = URL.OHLI.ANI.NOW

    return new Promise( (resolve, reject) => {
      parseJson( url )
      .catch( err => reject(err) )
      .then( list => {
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
        resolve(result)
      })
    })
  },


  /**
   * 자막제작자 찾기
   * @param  {Number}   aniId
   */
  subtitle( aniId ){
    const url = URL.OHLI.CAPTION.replace('<ani>', aniId)
    return parseJson( url )
  },


  /**
   * 캐시 조회
   * @param  {Number}   userId
   * @param  {Number}   aniId
   */
  cache( aniId, userId ){
    const url = URL.OHLI.CACHE
      .replace('<blog>', userId)
      .replace('<ani>', aniId)

    return new Promise( (resolve, reject) => {
      parseHtml( url )
      .catch( err => reject(err) )
      .then( body => {
        resolve( parseCache(body) )
      })
    })

  },
}
