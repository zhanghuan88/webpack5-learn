let fs = require('fs')

function createLoaderObject(request) {
    let loaderObject = {
        request,//loader的绝对路径
        normal: null,//loader函数本身
        pitch: null,//loader的pitch函数
        raw: false,//是否要转成字符串 raw=true表示传递给loader是一个buffer,加载图片的 默认值是false,表示传递是字符串
        data: {},//每一个loader都会自有一个自定义数据对象，用来存一些自定义信息
        pitchExecuted: false,//这个loader的pitch方法是不是已经 执行这了
        normalExecuted: false,//这个loader的norma1方法是不是已经 执行过
    }
    let normal = require(loaderObject.request)
    loaderObject.normal = normal
    loaderObject.pitch = normal.pitch
    loaderObject.raw = normal.raw
    return loaderObject;
}
function processResource(processOptions,loaderContext,finalCallback){
    loaderContext.loaderIndex=loaderContext.loaders.length-1;
    let resource = loaderContext.resource;
    //fs.readFile(resource)
    loaderContext.readResource(resource,(err,resourceBuffer)=>{
        if(err)return finalCallback(err);
        processOptions.resourceBuffer=resourceBuffer;//原始的文件内容
        console.log(resourceBuffer.toString());
        //我们的走完pitch ,也读到了文件，下一步该执行normal
    })
}
function iteratePitchingLoaders(processOptions,loaderContext,finalCallback){
    if(loaderContext.loaderIndex>=loaderContext.loaders.length){
        return processResource(processOptions,loaderContext,finalCallback);
    }
    let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
    if(currentLoaderObject.pitchExecuted){
        loaderContext .loaderIndex++;
        return iteratePitchingLoaders(processOptions, loaderContext, finalCallback);
    }
    let pitchFunction = currentLoaderObject.pitch;
    currentLoaderObject.pitchExecuted=true;//表示pitch函数已经执行过了
    if(!pitchFunction) {//如果说此loader没有提供pitch方法
        return iteratePitchingLoaders(processOptions, loaderContext, finalCallback);
    }
}
function runLoaders(options, callback) {
    let resource = options.resource;//获取 要到加载的资源 src/index.js
    let loaders = options.loaders || [];//要经过哪些loader进行处理
    let loaderContext = options.context || {};//loader执行上下文
    let readResource = options.readResource || fs.readFile;//读取文件内容的方法
    let loaderObjects = loaders.map(createLoaderObject)
    loaderContext.resource = resource;
    loaderContext.readResource = readResource;
    loaderContext.loaderIndex = 0;//当前要执行的loader索引
    loaderContext.loaders = loaderObjects;//所有的loader
    loaderContext.callback = null;//loader-runner传递给loader的回调函数
    loaderContext.async = null

    Object.defineProperty(loaderContext,"request",{
        get(){
            return loaderContext.loaders.map(l=>l.request).concat(loaderContext.resource).join("!")
        }
    })
    Object.defineProperty(loaderContext,"remainingRequest",{
        get(){
            return loaderContext.loaders.slice(loaderContext.loaderIndex+1).map(l=>l.request).concat(loaderContext.resource).join("!")
        }
    })
    Object.defineProperty(loaderContext,"currentRequest",{
        get(){
            return loaderContext.loaders.slice(loaderContext.loaderIndex).map(l=>l.request).concat(loaderContext.resource).join("!")
        }
    })
    Object.defineProperty(loaderContext,"previousRequest",{
        get(){
            return loaderContext.loaders.slice(0,loaderContext.loaderIndex).map(l=>l.request).join("!")
        }
    })
    Object.defineProperty(loaderContext,"data",{
        get(){
            return loaderContext.loaders[loaderContext.loaderIndex].data
        },
        set(value){
            loaderContext.loaders[loaderContext.loaderIndex].data = value
        }
    })
    let processOptions ={
        resourceBuffer:null,//要读取的资源的二进制内容 转换前的要加载的文件的内容
    }
    iteratePitchingLoaders(processOptions,loaderContext,(err,result)=>{
        callback(err,{
            result,
            resourceBuffer:processOptions.resourceBuffer
        })
    })
}

exports.runLoaders = runLoaders

