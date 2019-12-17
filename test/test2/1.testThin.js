var file= require('../../file')

var crf = file.getCurrentRedoFile(__dirname + '/testFiles/test')

console.log('crf:' + crf)

file.thin(crf)