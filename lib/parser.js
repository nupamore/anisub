
const fs = require('fs')
const Promise = require('bluebird')
const request = require('request-promise')
const htmlparser = require('htmlparser2')

const { URL } = JSON.parse( fs.readFileSync('config.json') )


/**
 * json 형식 파싱
 * @param  {String} url
 * @return {Promise}
 */
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


/**
 * html 형식 파싱
 * @param  {String} url
 * @return {Promise}
 */
function parseHtml( url ){
  return request.get( url )
}


/**
 * 다운로드 링크 찾기
 * @param  {String} body html
 * @param  {String} site 사이트 종류
 * @return {Array}
 */
function findDownLink( body, site ){
  const links = []

  if( site == 'naver' ){
    const regex = /http:\/\/blogattach.*?(\.smi|\.zip)/g
    const files = body.match(regex)

    files.forEach( file => {
      const arr = file.split('/')
      links.push({
        name: arr[arr.length-1],
        src: file
      })
    })
  }

  else{
    let sw = false
    const parser = new htmlparser.Parser({
      onopentag(name, attribs){
        if( name == 'a' && attribs.href && attribs.href.match(/\.zip|\.smi/) ){
          links.push({
            name: '',
            src: attribs.href
          })
          sw = true
        }
      },
      ontext( text ){
        if( sw ){
          links[links.length-1].name = text.trim()
          sw = false
        }
      }
    }, {decodeEntities: true})
    parser.write(body)
    parser.end()
  }

  return links
}


/**
 * Iframe 링크 찾기 (네이버 등)
 * @param  {String} body html
 * @param  {String} site 사이트 종류
 * @return {Array}
 */
function findIframe( body, site ){
  let url = ''
  const parser = new htmlparser.Parser({
    onopentag(name, attribs){
      if( site == 'naver' && name == 'frame' && attribs.id == 'mainFrame' ){
        url = `http://blog.naver.com/${ attribs.src }`
      }
    }
  }, {decodeEntities: true})
  parser.write(body)
  parser.end()

  return url
}


module.exports = {
  /**
   * 애니메이션 찾기
   * @param  {String}   keyword
   */
  anime( keyword ){
    const reqs = []

    for(let w=0; w<8; w++){
      const url = URL.ANISSIA.ANI.DAY.replace('<w>', w)
      reqs.push( parseJson(url) )
    }

    return Promise.all(reqs)
    .then( lists => {
      const list = lists.reduce( (p,n) => p.concat(n) )
      const works = list.filter( work => work.s.match(keyword) )
      return works
    })
  },


  /**
   * 자막제작자 찾기
   * @param  {Number}   aniId
   */
  subtitle( aniId ){
    const url = URL.ANISSIA.CAPTION.replace('<i>', aniId)
    return parseJson( url )
  },


  /**
   * 다운로드 찾기
   * @param  {String}   url
   */
  post( url ){
    url = `http://${url}`
    const site = url.match('naver.com') ? 'naver' : null

    return new Promise( (resolve, reject) => {
      parseHtml( url )
      .then( body => {
        // 네이버는 iframe까지 탐색
        return site ? parseHtml( findIframe(body, site) ) : body
      })
      .then( body => {
        resolve( findDownLink(body, site) )
      })
    })

  },
}
