const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
// 导入controller middleware:
const controller = require('./controller');
// 导入templating middleware来使用nunjucks前端模板
const templating = require('./templating');
// 导入router路由middleware
// session 有关模块
const session = require('koa-session')
// create a favicon
const favicon = require('koa-favicon');
const {accesslogger, uploadlogger} = require("./logSave");
// create a object to present web app
const app = new Koa();

// Determine whether it is a production environment
const isProduction = process.env.NODE_ENV === 'production';

app.keys = ['spatial-trans-web'];
const CONFIG = {
    key: 'spatial-trans-web:sess',   //cookie key (default is koa:sess)
    maxAge: 24 * 60 * 60 * 1000,  // cookie的过期时间 maxAge in ms (default is 1 days)
    overwrite: true,  //是否可以overwrite    (默认default true)
    httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
    signed: true,   //签名默认true
    rolling: false,  //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
    renew: false,  //(boolean) renew session when session is nearly expired,
    autoCommit:false,
};
app.use(session(CONFIG, app));

// log request URL and execution time:
app.use(accesslogger);
app.use(uploadlogger);

// load static files
if (! isProduction) {
    let staticFiles = require('./static-files');
    app.use(staticFiles('/static/', __dirname + '/static'));
}

// add post body parser
app.use(bodyParser());

// use Nunjucks as view
app.use(templating('views',{
    noCache: !isProduction,
    watch: !isProduction
}));

// add controller middleware to route URL
app.use(controller())
// add a favicon
app.use(favicon('，/static/images/favicon_io/android-chrome-192x192.png'));

app.listen(3000);
console.log('app started at port 3000 ...');
