var File = require('./file')

var Redo=function(path){
    var _this = this
    _this._index= 1
    _this._redoFile =
    _this._redoQueue=[]
    _this._order = false
    _this.file = new File(path)
    this.submit= this.commit= this.put = this.push= this.one =this.add = this.invoke = (p)=>{
        //judge p
        var id = _this._index++
        var redoP={
            id : id,

        }
        _this._redoQueue.push(redoP)

    }
    this.method = this.handler = this.how2do = this.how = this.two= this.howtodo=(handler,callback)=>{
        
    }
    //set method run sequencely
    this.order = this.sequence = (order=true)=>{
        _this._order = order
        return this
    }
}



module.exports = Redo
