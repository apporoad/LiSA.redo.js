
const redoEmpty = {}

var Redo=function(path){
    var _this = this
    _this.redoQueue=[]
    _this.submit= _this.commit= _this.put = _this.push= _this.one =_this.add = _this.invoke = (p)=>{
        //judge p

        _this.redoQueue.push(p)

    }
    _this.method = _this.handler = _this.how2do = _this.how = _this.two= _this.howtodo=(handler,callback)=>{

    }
    //set method run sequencely
    _this.order = _this.sequence = (order=true)=>{

    }
}



module.exports = Redo
