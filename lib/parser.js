
const fs = require('fs')
const request = require('request')
const htmlparser = require('htmlparser2')

const URL = JSON.parse( fs.readFileSync('config/url.json') )


function parseJson( url, cb ){
  request.get( url, (err, res, body) => {
    const list = JSON.parse(body)
    cb( list )
  })
}

function parseHtml( url, cb ){
  request.get( url, (err, res, body) => {
    cb( body )
  })
}


module.exports = {
  getAnimeList( keyword, cb ){
    const url = URL.OHLI.ANI.NOW

    parseJson( url, list => {
      const result = []
      list.forEach( day => {
        const works = day.filter( work => work.s.match(keyword) )
        if( works.length ) result.push(...works)
      })
      cb(result)
    })
  },

  getCaptionList( aniId, cb ){
    const url = URL.OHLI.CAPTION.replace('{ani}', aniId)
    parseJson( url, cb )
  },

  getFileList( userId, aniId, cb ){
    const url = URL.OHLI.CACHE
      .replace('{blog}', userId)
      .replace('{ani}', aniId)

    parseHtml( url, body => {
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
                ep: 0,
                file: []
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
            last.post = text
            last.ep = text.match(/([0-9.]+)화/)[1]*1
          }
        },
        onclosetag(name){
          if(name == "a" && sw.ep == true){
            sw.ep = false
          }
        }
      }, {decodeEntities: true})
      parser.write(body)
      parser.end()

      cb(files)
    })
  }
}
