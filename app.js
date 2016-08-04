/**
 * 框架核心程序入口
 *
 * Created by Chenjr on 2016/04/11
 */

'use strict';

const koa = require('koa'),
    conditional = require('koa-conditional-get'),
    etag = require('koa-etag'),
    path = require('path'),
    serve = require('koa-static'),
    bodyParser = require('koa-bodyparser'),
    compression = require('koa-compress'),
    render = require('koa-swig');

const app = global.app = koa(),
    router = require('./routes/router'),
    logger = require('./app/utils/logger').logger('app');


// access log
const fs = require('fs'),
    FileStreamRotator = require('file-stream-rotator'),
    morgan = require('koa-morgan'),
    logDir = path.join(__dirname, 'private/log');
fs.existsSync(logDir) || fs.mkdirSync(logDir); // ensure log directory exists
// create a rotating write stream
const accessLogStream = FileStreamRotator.getStream({
    filename: path.join(logDir, '/access.log.%DATE%'),
    frequency: 'daily', // minutes: 'm' i.e. 5m; hours 'h' i.e. 1h; daily: 'daily'
    verbose: false,
    date_format: "YYYY-MM-DD"
});

const argv = process.argv.slice();
if (argv.indexOf('--debug') >= 0 || process.env.UAE_MODE == 'DEV' || process.env.UAE_MODE == 'TEST') {
    app.use(morgan.middleware('dev'));
    global.debug = true;
} else {
    app.use(morgan.middleware('combined', {stream: accessLogStream}));
    global.debug = false;
}

// 配置文件
global.config = require('./conf/config.json');

// 视图引擎设置
app.context.render = render({
    root: path.join(__dirname, 'app/views'),
    autoescape: true,
    cache: global.debug ? false : 'memory',
    ext: 'html',
    locals: global.config.locals, // 传递到模板里的公共变量
    filters: require('./app/utils/filters')
});

// 暴露视图后端渲染接口
app.context.renderFile = render.swig.renderFile;

// 请求解析器
app.use(bodyParser());

// 启用gzip压缩
app.use(compression({threshold: global.config.gzip.threshold}));

// etag works together with conditional-get
app.use(conditional());
app.use(etag());

// 静态目录
app.use(serve(path.join(__dirname, 'public'), {
    maxage: global.config.staticCache.maxAge * 1000 // 注意，这个中间件的单位是ms，http maxage单位是s
}));

// 注册路由
router(app);

// 自运行josb初始化
require('./app/jobs/Jobs').start();

module.exports = app;
