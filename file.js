const fs = require('fs')
const Path = require('path')
const utils = require('lisa.utils')
const stringify = require('fast-safe-stringify')
const split = '@d@'
const cs = 'c' + split
const ds = 'd' + split

const defaultChangeNameInterval=5*60*1000
const defaultChangeNameSize= 50*1024*1024

function thin(currentRedoFile){

}


function getRedoFiles(name){
    var dir = Path.dirname(name)
    var filename= Path.basename(name)
    //console.log(filename)
    //just one bug for find
    var files = fs.readdirSync(Path.dirname(name))
    var redoFiles =[]
    files.forEach(element => {
        if(fs.statSync(Path.join(dir,element)).isFile()&& utils.startWith(element,filename)){
            redoFiles.push(Path.join(dir,element))
        }
    });
    return redoFiles
}

function getCurrentRedoFile(name){
    var files = getRedoFiles(name)
    var currentFile=null
    if(files && files.length>0){
        var fls = files.filter((f)=>{
            var ta=f.split(['.'])
            return !isNaN(ta[ta.length-1])
        })
        //console.log(fls)
        if(fls && fls.length>0){
            fls.sort((a,b)=>{
                 var aa=a.split(['.'])
                 var bb=b.split(['.'])
                 return parseInt(aa[aa.length-1]) - parseInt(bb[bb.length-1])
            })
            currentFile = fls[fls.length-1]
        }
    }
    return currentFile || name
}

function getNextRedoFile(name){
    var index = name.lastIndexOf('.')
    var pureFilePath = null
    var nextIndex = 1
    if(index==-1){
        pureFilePath = name
    }else {
        var last = name.substr(index+1)
        if(isNaN(last)){
            pureFilePath = name
        }else{
            pureFilePath = name.substring(0,index)
            nextIndex = parseInt(last) +1
        }
    }
    return pureFilePath + '.' + nextIndex
}

function RedoFile(name,options){
    var _this=this
    options = options || {}
    var changeNameInterval = options.changeNameInterval || defaultChangeNameInterval
    var changeNameSize = options.changeNameSize || defaultChangeNameSize
    _this._name = name
    _this.lastChangeNameTime=Date.now()
    _this.add=(id,p)=>{
        // p must be a json
        fs.appendFileSync(_this._name, cs + id + split+ stringify(p) + '\n','utf8')
        changeName()
    }
    _this.del=(id)=>{
        fs.appendFileSync(_this._name, ds + id + '\n','utf8')
    }

    var changeName=()=>{
        if(Date.now() - _this.lastChangeNameTime < changeNameInterval){
            return
        }
        _this.lastChangeNameTime = Date.now()
        fs.stat(_this._name,(error,s)=>{
            if(s.size()> changeNameSize){
               _this._name = getNextRedoFile(_this._name)
               if(!fs.existsSync(_this._name)){
                    fs.writeFileSync(_this._name,'','utf8')
                }
            }
        })
    }

    _this._name = getCurrentRedoFile(_this._name)
    if(!fs.existsSync(_this._name)){
        fs.writeFileSync(_this._name,'','utf8')
    }
}


module.exports = RedoFile

module.exports.test=function(){

    console.log(getRedoFiles(__dirname+'/test/test1/test.redodemo'))
    //console.log(getCurrentRedoFile(__dirname+'/test/test1/test.redodemo'))

    //console.log(getNextRedoFile(__dirname+'/test/test1/test.redodemo'))
    //console.log(getNextRedoFile(__dirname+'/test/test1/test.redodemo.11'))
    //console.log(getNextRedoFile(__dirname+'/test/test1/abc'))
}