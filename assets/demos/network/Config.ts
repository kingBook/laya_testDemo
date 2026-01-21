import axios from 'axios'
import { getToken } from './authority';

// 基本配置

// console.log("process.env.NODE_ENV = " + process.env.NODE_ENV)
let http = location.href.indexOf("https://") > -1 ? "https://" : "http://"
let netBowUrl, wsUrl;
if (window["$profile"] == "dev") {// 开发环境
    http = "http://";

    //+++++++++++连本地开始++++++++++++
    // netBowUrl =  "localhost:8961" 
    // axios.defaults.baseURL = " xxx:30199"   //api前缀
    // wsUrl = " xxx:30120";
    //+++++++++++连本地结束++++++++++++

    //+++++++++++连生产开始++++++++++++
    // netBowUrl =  " xxx:30199"  
    // axios.defaults.baseURL = " xxx:30199"   //api前缀
    // wsUrl = " xxx:30120";
    //+++++++++++连生产结束++++++++++++

    //+++++++++++连测试开始++++++++++++
    netBowUrl = "api.xxx.vip"
    axios.defaults.baseURL = "api.xxx.vip"   //api前缀
    wsUrl = "api.xxx.vip";
    //+++++++++++连测试结束++++++++++++

} else if (window["$profile"] == "pro") { // 生产环境
    http = "https://";
    netBowUrl = "www.xxx.com"
    axios.defaults.baseURL = "www.xxx.com"   //api前缀
    if (location.href.indexOf("xxx.top") > -1) {
        http = "http://";
        netBowUrl = "www.xxx.top"
        axios.defaults.baseURL = "www.xxx.top"   //api前缀
    }
} else if (window["$profile"] == "test") {// 测试环境
    http = "http://";
    netBowUrl = "www.xxx.vip"
    axios.defaults.baseURL = "www.xxx.vip"   //api前缀
}

netBowUrl = http + netBowUrl;
axios.defaults.baseURL = http + axios.defaults.baseURL;

const APP_ID = 29999
const TENANT_ID = 100000
// const APP_ID = 18861
// const TENANT_ID = 100000

const axio = axios.create({
    xsrfCookieName: 'xsrf-token',  // `xsrfCookieName` 是用作 xsrf token 的值的cookie的名称
    timeout: 12000,    // 如果请求话费了超过 `timeout` 的时间，请求将被中断
    // proxy: {    // 'proxy' 定义代理服务器的主机名称和端口
    //     host: '',
    //     port: 9000,
    // },
});

axio.interceptors.request.use(function (config) {
    // console.log("config = ", config)
    // config.params.appId = APP_ID
    // config.params.tenantId = TENANT_ID
    if (config.url.indexOf('/login') == -1 || config.url.indexOf('/login/') > -1) {
        if (getToken()) {
            // 客户端认证
            config.headers.WAuthorization = `Bearer ${getToken()}`;
        }
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

axio.interceptors.response.use(async function (response) {
    if (response.status == 401) {
        //history.push("/user/login");
        return {
            code: '401',
            success: false,
            msg: '授权已过期，请重新登录',
        };
    }

    // console.log("response = ", response)

    const res = response.data;

    //是否为分页
    // if (res && res.data && res.data.current && res.data.current >= 1) {
    //     const ret = {
    //         datas: res.data.datas,
    //         total: res.data.total,
    //         success: res.success,
    //         pageSize: res.data.size,
    //         pages: res.data.pages,
    //         current: res.data.current,
    //     };
    //     return ret;
    // }
    //新版接口返回格式
    if (res.Cmd) {
        // console.log("新版接口返回格式", res)
        return Promise.resolve(res);
    } else {
        return res;
    }
}, function (error) {
    console.log("res = ", error)
    // var response = error.response;
    // if (response.data.code == 400 && response.data.msg.indexOf("账号异常，无法获取") > -1) {
    //     localStorage.clear();
    //     return {
    //         code: '400',
    //         success: false,
    //         msg: '账户异常',
    //     };
    // }
    return Promise.reject(error);
});

export {
    axio,
    http,
    wsUrl,
    netBowUrl,
    APP_ID,
    TENANT_ID
};