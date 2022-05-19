const nunjucks = require('nunjucks');

function createEnv(path, opts) {
    var
        autoescape = opts.autoescape === undefined ? true : opts.autoescape,
        noCache = opts.noCache || false,
        watch = opts.watch || false,
        throwOnUndefined = opts.throwOnUndefined || false,
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(path, {
                noCache: noCache,
                watch: watch,
            }), {
                autoescape: autoescape,
                throwOnUndefined: throwOnUndefined
            });
    if (opts.filters) {
        for (var f in opts.filters) {
            env.addFilter(f, opts.filters[f]);
        }
    }
    return env;
}

function templating(path, opts){
    //创建Nunjucks的env对象：
    var env = createEnv(path, opts);
    // 继续处理请求：
    return async(ctx,next) =>{
        // 给ctx绑定render函数：
        ctx.render = function(view, model) {
            ctx.response.body = env.render(view,Object.assign({},ctx.state || {}, model || {}));
            // 设置content-type：
            ctx.response.type = 'text/html';
        };
        await next();
    };
};

module.exports = templating;