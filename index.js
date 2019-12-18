var File = require('./file')
var utils = require('lisa.utils')
var Lpromise = require('lisa.promise')

const defaultCBTimeout = 10000;

var Redo=function(path){
    var _this = this
    _this._index= 1
    _this._redoFile =
    _this._redoQueue=[]
    _this._order = false
    _this.file = new File(path)
    _this.promise = Lpromise()
    this.submit= this.commit= this.put = this.push= this.one =this.add = this.invoke = (p)=>{
        //judge p
        var id = _this._index++
        var redoP={
            id : id,
            param: p
        }
        _this.file.add(id,p)
        _this._redoQueue.push(redoP)

    }
    _this._handler
    _this._callback
    this.method = this.handler = this.how2do = this.how = this.two= this.howtodo=(handler,callback)=>{
        if(!handler || !utils.Type.isFunction(handler)){
            new Error('lisa.redo : your handler must be a function')
        }
        if(_this._handler){
            console.info('LiSA.redo you hava set handler more than once')

            _this._handler = handler
            _this._callback = callback
            return
        }
        _this._handler = handler
        _this._callback = callback
        //start run
        _this.promise.autoAction()
        _this.start()
    }
    //set method run sequencely
    this.order = this.sequence = (order=true)=>{
        _this._order = order
        if(order){
            _this.promise.serial()
        }else{
            _this.promise.parallel()
        }
        return this
    }

    _this.init=()=>{
        _this._redoQueue = _this.file.load()
        if(_this._redoQueue.length>0)
            _this._index = _this._redoQueue[_this._redoQueue.length - 1].id + 1
        //console.log(_this._redoQueue)
        //console.log(_this._index)
    }
    _this.init()
    _this.started = false
    this.stop = ()=>{
        _this.promise.stopAuto()
        _this.started = false
    }
    _this.start=()=>{
        _this.started = true
        var xdo = ()=>{
            var redo
            while(redo =_this._redoQueue.shift()){
                _this.promise.assign(rdo=>{
                    var _isCbed = false
                    var cb_finish = result=>{
                        _this.file.del(rdo.id)
                        _isCbed = true
                        if(_this._callback){
                            _this._callback(result,rdo.param)
                        }
                    }
                    var r = _this._handler(rdo.param,cb_finish)
                    if(r=== undefined){
                        // no return
                        setTimeout(()=>{
                            if(!_isCbed){
                                throw Error('LiSA.redo your action must be cbed, or return a result to finish action')
                            }
                        },defaultCBTimeout)
                    }else if(r && r.then){
                        // return Promise()
                        r.then(data=> cb_finish(data))
                    }else{
                        cb_finish(r)
                    }

                },redo)
            }
            if(_this.started)
                setTimeout(xdo, 50);
        }
        xdo()        
    }
}



module.exports =(path)=>{
    return new Redo(path)
} 
