var RedoFile = require('./file')

var file = new RedoFile(__dirname + '/test/test.redo')


// for(var i=0;i<10000;i++){
//     file.add(1,{name:'LiSA'})

//     file.del(1)
// }


RedoFile.test()