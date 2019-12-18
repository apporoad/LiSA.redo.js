var test=require('./index')(__dirname+'/test/test.redo')
test.order()

count=0
test.handler((params,cb)=>{
    //console.log(params)
    //cb("hello")
    // return "hello"
    count++
    return new Promise((r,j)=>{
        r(params)
    })
},(result,redo)=>{
    //console.log(result)
    if(count%100 ==0){
        console.log(count)
    }
})

//test.invoke({name:"LiSA",age:32})

// setTimeout(() => {
//     test.stop()
// }, 400);

var i=1
setInterval(() => {
     test.commit({name:'1154', index: i++})
}, 5);