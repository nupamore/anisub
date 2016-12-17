
const program = require('commander')
const anisub = require('../lib/anisub.js')

/**
 * CLI
 */
program.version('0.1.0')

program.command('now [name] [user]')
.description('애니메이션의 최신화를 검색합니다')
.action( (name, user) => {
  anisub.now(name, user)
})

program.command('down [name] [user] [filter]')
.description('애니메이션의 자막을 다운로드합니다')
.action( (name, user, filter) => {
  anisub.now(name, user)
  .then( result => anisub.down(result, filter) )
})

program.parse(process.argv)
