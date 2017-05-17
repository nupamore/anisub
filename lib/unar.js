
const os = require('os').platform()
const exec = require('child_process').exec
const fs = require('fs')
const decompress = require('decompress')
const file = require('./file')

const url = {
  darwin: 'http://unarchiver.c3.cx/downloads/unar1.10.1.zip',
  win32: 'http://unarchiver.c3.cx/downloads/unar1.8.1_win.zip'
}

if(os == 'darwin') {
  console.log(`download.. ${url.darwin}`)
  file.download(url.darwin, 'unar.zip')
  .then(zip => {
    decompress(zip, '.')
    .then(files => {
      file.unlinkSync(zip)
      files.forEach(f => exec(`sudo mv ${f.path} /usr/local/bin`))
    })
  })
}

if(os == 'win32') {
  console.log(`download.. ${url.win32}`)
  file.download(url.win32, 'unar.zip')
  .then(zip => {
    decompress(zip, '.')
    .then(() => file.unlinkSync(zip))
  })
}
