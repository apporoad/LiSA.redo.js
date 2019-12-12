var file = require('./file')

var Redo=function(path){
    var _this = this
    _this._index= 1
    _this._redoFile =
    _this._redoQueue=[]
    _this._order = false
    _this.submit= _this.commit= _this.put = _this.push= _this.one =_this.add = _this.invoke = (p)=>{
        //judge p
        var id = _this._index++
        var redoP={
            id : id,

        }
        _this._redoQueue.push(redoP)

    }
    _this.method = _this.handler = _this.how2do = _this.how = _this.two= _this.howtodo=(handler,callback)=>{
        
    }
    //set method run sequencely
    _this.order = _this.sequence = (order=true)=>{
        _this._order = order
    }
}



module.exports = Redo
