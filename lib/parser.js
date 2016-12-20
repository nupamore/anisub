
const fs = require('fs')
const Promise = require('bluebird')
const request = require('request-promise')
const htmlparser = require('htmlparser2')

const { URL } = JSON.parse( fs.readFileSync(`${__dirname}/../config.json`) )


/**
 * json 형식 파싱
 * @param  {String} url
 * @return {Promise}
 */
function parseJson( url ){
  return new Promise( (resolve, reject) => {
    request.get( encodeURI(url) )
    .catch( err => reject(err) )
    .then( body => {
      if( body[0] != '[' ){
        resolve([])
        return
      }
      const list = JSON.parse( body.replace(/\t+/g,'') )
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
  return request.get( encodeURI(url) )
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
      let arr = file.split('/')
      arr = arr[arr.length-1].split('\'')
      const filename = arr[arr.length-1]

      links.push({
        name: filename,
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
   * @param  {String}   end     방영중
   */
  anime( keyword, end ){
    const anissiaDays = []
    const anissiaEnds = []
    const ohliDays = []

    // 방영
    if( !end ){
      for(let w=0; w<=URL.ANISSIA.NUM.DAY; w++){
        const url = URL.ANISSIA.ANI.DAY.replace('<w>', w)
        anissiaDays.push( parseJson(url) )
      }
      for(let w=0; w<=URL.OHLI.NUM.DAY; w++){
        const url = URL.OHLI.ANI.DAY.replace('<w>', w)
        ohliDays.push( parseJson(url) )
      }
    }
    // 종영
    else{
      for(let p=0; p<=URL.ANISSIA.NUM.END; p++){
        const url = URL.ANISSIA.ANI.END.replace('<p>', p)
        anissiaEnds.push( parseJson(url) )
      }
    }


    return new Promise( (resolve, reject) => {
      const lists = []

      Promise.all(anissiaDays)
      .then( list => {
        list.forEach( _ => _.forEach( _ => {
          _.api = 'ANISSIA'
          lists.push(_)
        }))
        return Promise.all(ohliDays)
      })
      .then( list => {
        list.forEach( _ => _.forEach( _ => {
          _.api = 'OHLI'
          lists.push(_)
        }))
        return Promise.all(anissiaEnds)
      })
      .then( list => {
        list.forEach( _ => _.forEach( _ => {
          _.api = 'ANISSIA'
          lists.push(_)
        }))
        return lists
      })
      .then( list => {
        keyword = keyword.toLowerCase()
        const works = list.filter( work => {
          if( work.s.toLowerCase().match(keyword) ){
            work.s += ` (${work.api})`
            return true
          }
        })

        if( works.length ) resolve(works)
        else reject('애니를 찾을 수 없습니다')
      })
    })
  },


  /**
   * 자막제작자 찾기
   * @param  {Number}   api
   * @param  {Number}   aniId
   */
  subtitle( api, aniId ){
    const url = (api == 'ANISSIA')
      ? URL.ANISSIA.CAPTION.replace('<i>', aniId)
      : URL.OHLI.CAPTION.replace('<i>', aniId)
    return new Promise( (resolve, reject) => {
      parseJson( url )
      .then( json => {
        if( json.length ) resolve(json)
        else reject('자막을 찾을 수 없습니다')
      })
    })
  },


  /**
   * 다운로드 찾기
   * @param  {String}   url
   */
  post( url ){
    url = !url.match('http://') ? `http://${url}` : url
    const site = url.match('naver.com') ? 'naver' : null
    console.log(url+'\n');

    return new Promise( (resolve, reject) => {
      parseHtml( url )
      .then( body => {
        // 네이버는 iframe까지 탐색
        const iframe = (site=='naver') && !url.match('PostList')
        return iframe ? parseHtml( findIframe(body, site) ) : body
      })
      .then( body => {
        const list = findDownLink(body, site)
        if( list.length ) resolve(list)
        else reject('다운로드 링크를 찾을 수 없습니다')
      })
    })

  },
}
