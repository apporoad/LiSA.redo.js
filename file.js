const fs = require('fs')
const Path = require('path')


function RedoFile(name){
    var _this=this
    _this.name = name


}

exports.loadOrCreate= function(path){
    var messages=null
    if(fs.existsSync(path)){
        messages= fs.readFileSync(path,'utf8')
    }
    else{
        fs.writeFileSync(path,"",'utf8')
    }
    //put into queue
    return messages
}
