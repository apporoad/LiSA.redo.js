<div align=center><img src="https://raw.githubusercontent.com/apporoad/LiSA.redo.js/master/docs/redo-log.png"/></div>  

# LiSA.redo.js
redo log for node

[![avatar](https://raw.githubusercontent.com/apporoad/LiSA.redo.js/master/docs/redo.js.png "link to jpg")](https://raw.githubusercontent.com/apporoad/LiSA.redo.js/master/docs/redo.js.png)  

## just try it
```bash
npm i --save lisa.redo
```

```js

var testRedo=require('lisa.redo')(__dirname+'/test.redo')

//set redo run by order
testRedo.order()

//set redo's handler
testRedo.handler((params,cb)=>{
    console.log(params)
    //cb("hello")
    // return "hello"
    return new Promise((r,j)=>{
        r('hello')
    })
},(result,redo)=>{
    console.log('here is callback ' , result)
    console.log('redo :', redo)
})

// here invoke
testRedo.invoke({name:"LiSA",age:32})

```

## about redo

### 使用场景

1. 如果你调用一个接口、资源很穿重并且不需要立即获得返回值
2. 如果你需要缓冲这些请求或者调用
2. 如果你需要保障所有请求都被处理
3. 如果你需要保障故障发生后，之前的请求依旧会被执行
4. 所以你可以把它看作一个高性能的缓冲层