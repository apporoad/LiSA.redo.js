const fs = require('fs')
const Path = require('path')
const utils = require('lisa.utils')
const stringify = require('fast-safe-stringify')
const lineByLine = require('n-readlines')
const debug = require('debug')('LiSA.redo.file')
const split = '@d@'
const cs = 'c' + split
const ds = 'd' + split

const defaultChangeNameInterval=5*60*1000
const defaultChangeNameSize= 50*1024*1024
const defaultChangeNameCount=10000
// if bigger than 14m , it is better use big-map
const defaultThinMapSize = 1000000
const defaultWriteBatchSize = 50000

function load(currentRedoFile){
    var redoFiles = getThinRedoFiles(currentRedoFile)
    var alls = (redoFiles.needThin || []).concat(redoFiles.thined||[])
    alls.push(currentRedoFile)
    alls.sort((a,b)=>{
        var aa  = utils.endTrim(a,'.thin')
        var bb = utils.endTrim(b,'.thin')
        var aa = getLastNumber(aa) || 0
        var bb = getLastNumber(bb) || 0
        if(aa){
            aa = aa.index
        }
        if(bb){
            bb = bb.index
        }
        //console.log(a,aa,b,bb)
        if(aa==bb){
            //console.log('xxxxxxxxxxxxxxxxxxx')
            return utils.endWith(a,'.thin') ? 1 : -1
        }
        return aa - bb
    })
    var mapAll = new Map()
    alls.forEach(f=>{
        readOneFile(mapAll,f)
    })
    return mapAll
}

function thin(currentRedoFile){
    var thinFileInfos = getThinRedoFiles(currentRedoFile)
    //warn unexpected
    if(thinFileInfos.unexpected.length>0){
        thinFileInfos.unexpected.forEach(f=>{
            debug("redo.file unexpected files: " , f)
        })
    }
    //unlink thining
    if(thinFileInfos.thining.length>0){
        thinFileInfos.thining.forEach(f=>{
            fs.unlink(f,()=>{})
        })
    }
    var realNeedThins= null
    //get real need thin
    realNeedThins = thinFileInfos.needThin.concat(thinFileInfos.thined)

    realNeedThins.sort((a,b)=>{
        var aa  = utils.endTrim(a,'.thin')
        var bb = utils.endTrim(b,'.thin')
        var aa = getLastNumber(aa) || 0
        var bb = getLastNumber(bb) || 0
        if(aa){
            aa = aa.index
        }
        if(bb){
            bb = bb.index
        }
        //console.log(a,aa,b,bb)
        if(aa==bb){
            //console.log('xxxxxxxxxxxxxxxxxxx')
            return utils.endWith(a,'.thin') ? 1 : -1
        }
        return aa - bb
    })

    //console.log(realNeedThins)
    return doThin(realNeedThins)
    //return realNeedThins
}

function doThin(needThinFiles){
    //console.log(needThinFiles)
    if(needThinFiles.length==0){
        return
    }
    if(utils.endWith(needThinFiles[needThinFiles.length-1],'.thin')){
        //no need to thin
        debug('LiSA.redo.file lastThinfile， no need to thin')
        return
    }
    var thiningMap = new Map()
    needThinFiles.forEach(ntf=>{
        readOneFile(thiningMap,ntf)
    })
    //console.log('aaa')
    var thiningFileName = needThinFiles[needThinFiles.length-1] + '.thining'
    //write 2 thining
    write2File(thiningMap,thiningFileName)
    //mv thining file
    fs.renameSync(thiningFileName,needThinFiles[needThinFiles.length-1] + '.thin')
    // unlink needThinFiles
    needThinFiles.forEach(f=>{
        //console.log(f)
        debug('rm :' +f)
        fs.unlink(f,()=>{})
    })
    return thiningMap
}

function write2File(map,tgtFile){
    var buffer =''
    var index = 0 
    if(!fs.existsSync(tgtFile)){
        fs.writeFileSync(tgtFile,'','utf8')
    }
    for (var item of map.entries()) {
        buffer += cs+ item[0] + split + item[1] + '\n'
        index++

        if(index>defaultWriteBatchSize){
            fs.appendFileSync(tgtFile,buffer,'utf8')
            index=0
            buffer=''
        }
    }
    if(buffer.length>0)
        fs.appendFileSync(tgtFile,buffer,'utf8')
}

function readOneFile(map,needThinFile){
    var liner = new lineByLine(needThinFile)
    let line
    let lineNumber = 0
    while (line = liner.next()) {
        //console.log('Line ' + lineNumber + ': ' + line.toString('utf8'));
        if(line){
            //console.log(line)
            var temp = line.toString('utf8').split(split)
            if(temp.length>1){
                //console.log(temp)
                if(temp[0]==='c'){
                    map.set(parseInt(temp[1]),temp[2])
                }else if(temp[0]==='d'){
                    //console.log('del:' +temp[1])
                    map.delete(parseInt(temp[1]))
                }
            }
        }
        // too large judgement
        if(lineNumber> defaultThinMapSize && lineNumber % (defaultThinMapSize/10).toFixed(0) == 0){
            if(map.size > defaultThinMapSize){
                throw Error('lisa.redo.file map too large when reading:' + needThinFile)
            }
        }
        lineNumber++;
    }
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
    this.add=(id,p)=>{
        // p must be a json
        fs.appendFileSync(_this._name, cs + id + split+ stringify(p) + '\n','utf8')
        _this.count++
        changeName()
    }
    this.del=(id)=>{
        fs.appendFileSync(_this._name, ds + id + '\n','utf8')
    }

    this.load=()=>{
        var curr = getCurrentRedoFile(_this._name)
        var map = load(curr)
        var array =[]
        for (var item of map.entries()) {
            array.push({
                id : item[0],
                param : JSON.parse(item[1])
            })
        }
        return array
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
            //do thin
            thin(_this._name)
        }
    }

    _this._name = getCurrentRedoFile(_this._name)
    if(!fs.existsSync(_this._name)){
        fs.writeFileSync(_this._name,'','utf8')
    }
}


module.exports = RedoFile

module.exports.thin = thin

module.exports.load = load

module.exports.getCurrentRedoFile = getCurrentRedoFile

module.exports.test=function(){

    //console.log(getRedoFiles(__dirname+'/test/test1/test.redodemo'))
    //console.log(getCurrentRedoFile(__dirname+'/test/test1/test.redodemo'))

    //console.log(getThinRedoFiles(__dirname+'/test/test1/test.redodemo.11'))

    //console.log(getNextRedoFile(__dirname+'/test/test1/test.redodemo'))
    //console.log(getNextRedoFile(__dirname+'/test/test1/test.redodemo.11'))
    //console.log(getNextRedoFile(__dirname+'/test/test1/abc'))

    //console.log(thin(__dirname+'/test/test1/test.redodemo.11'))

}