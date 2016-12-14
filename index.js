
const parser = require('./lib/parser.js')
const file = require('./lib/file.js')


module.exports = {
  ani: parser.getAnimeList,
  caption: parser.getCaptionList,
  file: parser.getFileList,
  download: file.download,
}


// test
module.exports.file( 4, 1191, files => {
  console.log(files);
})
