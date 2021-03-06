# anisub
크로스플랫폼 애니메이션 한국어 자막 다운로드 CLI & API

http://www.anissia.net/?m=1&b=4  
http://ohli.moe/api  (종영 미지원)

<br>

![sample](http://nupamore.github.io/img/anisub_sample.gif)


## Installation

    $ npm install anisub -g


## Usage
<pre>
Usage: anisub [options] [command]

  Commands:

    now [name] [user]            애니메이션의 최신화를 검색합니다
    end [name] [user]            종영된 애니메이션을 검색합니다
    down [name] [user] [filter]  애니메이션의 자막을 다운로드합니다

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -e, --end      종영된 애니메이션
</pre>
<br>

## API
``` js
const anisub = require('anisub')

// 최신화 검색
anisub.now( '애니제목' )
// 자막 다운로드
.then( result => anisub.down(result) )
.then( files => console.log(files) )
```

### anisub.now( string, string )
` anisub.now('애니제목', '자막제작자') `  
<br>
문자열 혹은 정규식을 전달하면 해당하는 첫번째 객체를 선택하여 Promise객체를 반환합니다.

### anisub.down( object, [regex..] )
`anisub.down(reuslt, ['.zip', 'Leopard'])`  
<br>
`.now()`의 결과를 가지고 파싱하여 첫번째 필터로 다운받을 파일을 선택하고 두번째 필터로 압축을 풀 파일을 선택합니다.

### anisub.end( string, string )
`anisub.end('애니제목', '자막제작자')`  
<br>
종영된 작품들을 찾습니다.

<br>

## etc
`anisub.parser.anime( name, ended ) :Promise`  
`anisub.parser.subtitle( aniId ) :Promise`  
`anisub.parser.post( url ) :Promise`  
<br>
`anisub.file.directory( path ) :string`  
`anisub.file.download( url, filename ) :Promise`  
`anisub.file.list( zipname ) :Promise`  
`anisub.file.unpack( zipname, files ) :Promise`  
`anisub.file.unlinkSync( filename )`  
