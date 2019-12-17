var file= require('../../file')

var crf = file.getCurrentRedoFile(__dirname + '/testFiles/test')


var map = file.load(crf)

console.log(file.load(crf))
console.log(map.size)