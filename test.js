const anisub = require('./lib/main')

// 최신화 검색
anisub.now( '블렌드' )
// 자막 다운로드
.then( result => anisub.down(result) )
.then( files => console.log(files) )
