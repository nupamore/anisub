# anisub
애니메이션 한국어 자막 API

http://www.anissia.net/?m=1&b=4  
http://ohli.moe/api  (종영 미지원)

<br>




###Install
`$ npm install anisub`

###Usage
``` js
const anisub = require('anisub')

// 최신화 검색
anisub.now( '애니제목' )
// 자막 다운로드
.then( result => anisub.down(result) )
```

###API

###anisub.now( string, string )
`anisub.now('애니제목', '자막제작자')`  
<br>
문자열 혹은 정규식을 전달하면 해당하는 첫번째 객체를 선택하여 Promise객체를 반환합니다.

###anisub.down( object, [regex..] )
`anisub.down(reuslt, ['.zip', 'Leopard'])`  
<br>
`.now()`의 결과를 가지고 파싱하여 첫번째 필터로 다운받을 파일을 선택하고 두번째 필터로 압축을 풀 파일을 선택합니다.

###anisub.end( string, string )
`anisub.now('애니제목', '자막제작자')`  
<br>
종영된 작품들을 찾습니다.

<br>

###etc
`anisub.parser.anime( name ) :Promise`  
`anisub.parser.subtitle( aniId ) :Promise`  
`anisub.parser.post( url ) :Promise`  
<br>
`anisub.file.directory( path ) :string`  
`anisub.file.download( url, filename ) :Promise`  
`anisub.file.listZip( zipname ) :array`  
`anisub.file.unZip( zipname, filename )`  
`anisub.file.unLinkSync( filename )`  
