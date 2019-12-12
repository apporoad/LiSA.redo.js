var RedoFile = require('./file')
var file = new RedoFile(__dirname + '/test/test.redo')

// for(var i=0;i<10000000;i++){
//     file.add(i,{name:'LiSA'})
//     file.del(i)
// }


RedoFile.test()