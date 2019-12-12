const fs = require('fs')
const Path = require('path')
const utils = require('lisa.utils')
const stringify = require('fast-safe-stringify')
const split = '@d@'
const cs = 'c' + split
const ds = 'd' + split

const defaultChangeNameInterval=5*60*1000
const defaultChangeNameSize= 50*1024*1024
const defaultChangeNameCount=10000

function thin(currentRedoFile){
    var thinFileInfos = getThinRedoFiles(currentRedoFile)
    //warn unexpected
    if(thinFileInfos.unexpected.length>0){
        thinFileInfos.unexpected.forEach(f=>{
            console.debug("redo.file unexpected files: " , f)
        })
    }
    //unlink thining
    if(thinFileInfos.thining.length>0){
        thinFileInfos.thining.forEach(f=>{
            fs.unlink(f)
        })
    }
    //get real need thin
    var realNeedThins = thinFileInfos.needThin.concat(thinFileInfos.thined)
    realNeedThins.sort()
    doThin(realNeedThins)
}

function doThin(needThinFiles){
    var thiningFileName = '??'
    //todo
}

function getThinRedoFiles(currentRedoFile){
    var index = getLastNumber(currentRedoFile)
    if(!index){
        return []
    }
    var files = getRedoFiles(currentRedoFile.substring(0,index.position))
    var needThinFiles =[]
    var thinedFiles=[]
    var thiningFiles=[]
    var unexpected = []
    files.forEach(f=>{
        var i = getLastNumber(f)
        if(i){
            if(i.index< index.index){
                needThinFiles.push(f)
            }else{
                unexpected.push(f)
            }
        }else{
            if(utils.endWith(f,'.thin')){
                thinedFiles.push(f)
            }else if(utils.endWith(f,'.thining')){
                thiningFiles.push(f)
            }else{
                needThinFiles.push(f)
            }
        }
    })
    return {
        needThin: needThinFiles,
        thined : thinedFiles,
        thining : thiningFiles,
        unexpected : unexpected
    }
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
function getLastNumber(name){
   var index = name.lastIndexOf('.')
   if(index==-1){
       return null
   } else{
       var last = name.substr(index+1)
       if(isNaN(last)){
            return null
       }else{
           return { index: parseInt(last),
                    position : index }
       }
   }
}
function getNextRedoFile(name){
    var index = getLastNumber(name)
    var pureFilePath = null
    var nextIndex = 1
    if(!index){
        pureFilePath = name
    }else {
        pureFilePath = name.substring(0,index.position)
        nextIndex = index.index +1
    }
    return pureFilePath + '.' + nextIndex
}

function RedoFile(name,options){
    var _this=this
    options = options || {}
    var changeNameInterval = options.changeNameInterval || defaultChangeNameInterval
    var changeNameSize = options.changeNameSize || defaultChangeNameSize
    var changeNameCount = options.changeNameCount || defaultChangeNameCount
    _this._name = name
    _this.lastChangeNameTime=Date.now()
    _this.count =0
    _this.add=(id,p)=>{
        // p must be a json
        fs.appendFileSync(_this._name, cs + id + split+ stringify(p) + '\n','utf8')
        _this.count++
        changeName()
    }
    _this.del=(id)=>{
        fs.appendFileSync(_this._name, ds + id + '\n','utf8')
    }

    var changeName=()=>{
        var isReachInterval = Date.now() - _this.lastChangeNameTime > changeNameInterval
        var isReachCount = _this.count > changeNameCount
        if(!isReachCount && !isReachInterval){
            return
        }
        //console.log(_this.count, ' 1 ' , _this.lastChangeNameTime)
        _this.count=0
        _this.lastChangeNameTime = Date.now()
        var stat = fs.statSync(_this._name)
        //console.log(stat.size,'aaaaaa')
        if(stat.size> changeNameSize){
            _this._name = getNextRedoFile(_this._name)
            if(!fs.existsSync(_this._name)){
                fs.writeFileSync(_this._name,'','utf8')
            }
        }
    }

    _this._name = getCurrentRedoFile(_this._name)
    if(!fs.existsSync(_this._name)){
        fs.writeFileSync(_this._name,'','utf8')
    }
}


module.exports = RedoFile

module.exports.test=function(){

    //console.log(getRedoFiles(__dirname+'/test/test1/test.redodemo'))
    //console.log(getCurrentRedoFile(__dirname+'/test/test1/test.redodemo'))

    console.log(getThinRedoFiles(__dirname+'/test/test1/test.redodemo.11'))

    //console.log(getNextRedoFile(__dirname+'/test/test1/test.redodemo'))
    //console.log(getNextRedoFile(__dirname+'/test/test1/test.redodemo.11'))
    //console.log(getNextRedoFile(__dirname+'/test/test1/abc'))


}