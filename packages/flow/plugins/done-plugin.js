 class DonePlugin{
    apply(compiler){
        compiler.hooks.done.tap("DonePlugin",()=>{
            console.log(compiler)
        })
    }
}
module.exports = DonePlugin
