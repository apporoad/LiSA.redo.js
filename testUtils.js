var fs = require('fs')
console.log('0123456789我是中国人0123456789我是中国人0123456789我是中国人0123456789我是中国人0123456789我是中国人'.length)

console.log(fs.statSync(__dirname+'/test/test1/test.redodemo').size)



var date1= Date.now()

var count = 1000000
var str = ''

for(var i =0;i<count;i++){
    str = str + '11111'
}

var date2=Date.now()

var strArray=[]

for(var i=0;i< count;i++){
    strArray.push('11111')
}
//var str2= strArray.join()
var date3 = Date.now()

console.log('took :' + (date2-date1))
console.log('took :' +(date3-date2))
