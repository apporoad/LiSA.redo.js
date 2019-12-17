var test=require('./index')(__dirname+'/test.redo').order()

test.handler((params,cb)=>{
    console.log(params)
    cb("hello")
},(result,redo)=>{
    console.log('here is callback ' , result)
    console.log('redo :', redo)
})


test.invoke({name:"LiSA",age:32})
