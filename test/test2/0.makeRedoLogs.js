var file = require('../../file')

var testFile = new file(__dirname+'/testFiles/test.redo',{
    changeNameCount: 100,
    changeNameSize : 1024*5,
    changeNameInterval : 1000*60
})

var i = 1 
var add = ()=>{
    testFile.add(i,{hello: i ++})
    if(i>10000){
        return
    }
    setTimeout(() => {
        add()        
    }, 10);
}
add()
var j = 1
var del =()=>{
    testFile.del(j++)
    if(j>8000){
        return
    }
    setTimeout(() => {
        del()
    }, 12);
}

del()