var test=require('./index')(__dirname+'/temp.redo').order()



test.handler((params,cb)=>{
    console.log(params)
    cb("hello")
})




test.invoke({name:"LiSA",age:32},(result)=>{
    console.log("here is callback: ", result)
})