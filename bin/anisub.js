#!/usr/bin/env node

const program = require('commander')
const inquirer = require('inquirer')

const anisub = require('../lib/main.js')

/**
 * CLI
 */
program.version('0.2.0')

program.command('now [name] [user]')
.description('애니메이션의 최신화를 검색합니다')
.action( (name, user) => {
  anisub.now(name, user)
})

program.command('down [name] [user] [filter]')
.option('-e, --end', '종영된 애니메이션')
.description('애니메이션의 자막을 다운로드합니다')
.action( (name, user, filter, options) => {
  /**
   * 파라미터가 없는 경우
   */
  if( !name && !user && !filter ){
    const prompt = inquirer.createPromptModule()
    const b = {}

    prompt({
      type: 'prompt',
      name: 'keyword',
      message: '애니제목을 입력해주세요:',
    })
    .then( answer => anisub.parser.anime(answer.keyword.trim(), options.end) )
    // 애니 선택
    .then( list => {
      b.aniList = list
      return prompt({
        type: 'list',
        name: 'ani',
        message: '애니:',
        choices: list.map(_=>_.s),
      })
    })
    .then( answer => {
      b.ani = b.aniList.find( _ => _.s == answer.ani )
      return anisub.parser.subtitle(b.ani.api, b.ani.i)
    })
    // 자막 선택
    .then( list => {
      b.userList = list.map( _ => {
        _.n = `${_.n} (${_.s}화)`
        return _
      })
      return prompt({
        type: 'list',
        name: 'user',
        message: '자막:',
        choices: list.map(_=>_.n),
      })
    })
    .then( answer => {
      b.user = b.userList.find( _ => _.n == answer.user )
      return anisub.parser.post(b.user.a)
    })
    // 다운로드 선택
    .then( list => {
      b.downList = list
      return prompt({
        type: 'list',
        name: 'down',
        message: '다운로드:',
        choices: list.map(_=>_.name),
      })
    })
    .then( answer => {
      b.down = b.downList.find( _ => _.name == answer.down )
      return anisub.file.download(b.down.src, b.down.name)
    })
    // 자막 파일 선택
    .then( filename => {
      b.filename = filename
      if( !filename.match('.zip') ) return
      else{
        b.fileList = anisub.file.listZip(filename)
          .reduce( (p,n) => p.concat(n.path), [] )

        return prompt({
          type: 'list',
          name: 'subtitle',
          message: '파일:',
          choices: ['all'].concat(b.fileList),
        })
      }
    })
    .then( answer => {
      if( !answer ) return
      // 전부 압축풀기
      if( answer.subtitle == 'all' ){
        b.fileList.forEach( file => {
          anisub.file.unZip( b.filename, file )
        })
      }
      // 하나만 풀기
      else{
        anisub.file.unZip( b.filename, answer.subtitle )
      }

      anisub.file.unlinkSync( b.filename )
    })
    .catch( err => console.log(err) )
  }


  /**
   * 파라미터가 있는 경우
   */
  else{
    anisub.now(name, user)
    .then( result => anisub.down(result, filter) )
  }
})

program.parse(process.argv)
