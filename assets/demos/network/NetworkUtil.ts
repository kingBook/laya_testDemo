const { regClass, property } = Laya;
import Browser = Laya.Browser;
//@regClass()
export class NetworkUtil {

    public static TAG_TOKEN: string = "XB_TOKEN";
    public static RR_TOKEN: string = "rr-token";

    public static getVisitorCookie(): string {
        return NetworkUtil.getCookie("UG-VISITOR-TOKEN");
    }

    public static setVisitorCookie(cookie: string): void {
        NetworkUtil.setCookie("UG-VISITOR-TOKEN", cookie);
    }

    public static getCookie(c_name: string) {
        var cookie = document.cookie;
        if (!(window.self === window.top)) {
            //判断是否是再iframe里面，如果是就让父页面去处理
            cookie = Browser.window.myCookie;
        }
        if (cookie && cookie.length > 0) {
            let c_start = cookie.indexOf(c_name + "=")
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                let c_end = cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = cookie.length;
                return unescape(cookie.substring(c_start, c_end));
            }
        }
        return "";
    }

    public static setCookie(c_name: string, value: string) {
        var expireSecs = 7 * 24 * 60 * 60;
        var exdate = new Date();
        exdate.setSeconds(exdate.getSeconds() + expireSecs)
        // console.log("myCookie11111111");
        if (!(window.self === window.top)) {
            // console.log("myCookie22222");
            //判断是否是再iframe里面，如果是就让父页面去处理
            var newCookie = "";
            if (Browser.window.myCookie) {
                var strings = Browser.window.myCookie.split(';');

                for (let i = 0; i < strings.length; i++) {
                    var item = strings[i];
                    //把没有相同名字的item，加进去
                    if (item.indexOf(c_name) <= -1) {
                        newCookie += item;
                        newCookie += ";";
                    }
                }
            }
            // console.log("myCookie333333");
            newCookie += c_name + "=" + escape(value) + ((expireSecs == null || expireSecs == undefined) ? "" : ";expires=" + exdate.toUTCString() + ";");
            Browser.window.myCookie = newCookie;
            // console.log("myCookie="+window.myCookie);
            // console.log("bbbbbbbbbb="+window.getParentDomain());
            window.parent.postMessage({ msg: 'setCookie', data: { key: c_name, value: value, time: exdate.toUTCString() } }, NetworkUtil.getParentDomain());
            return;
            // }

        }
        // console.log("myCookie4444444");
        document.cookie = c_name + "=" + escape(value) + ((expireSecs == null) ? "" : ";expires=" + exdate.toUTCString() + ";")
    }

    public static getParentDomain() {
        var url = document.referrer;
        var arrUrl = url.split("?");
        var para = arrUrl[0];
        if (Browser.window.parentDomain == "*") {
            return "*";
        } else {
            if (url.indexOf(Browser.window.parentDomain) > -1) {
                return para;
            }
        }
    }

    /**获取对应功能的域名地址  */
    public static getDomainName(name: string) {
        //domain = "http://www.baidu.com"
        var domain = window.location.host;
        if (domain.indexOf(":") > -1) {
            domain = domain.substring(0, domain.indexOf(":"));
        }
        var ipRegex = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        var isIp = ipRegex.test(domain);
        console.log("当前domain  ", domain, isIp)
        if (isIp) {
            return NetworkUtil.getQueryString(name);
        } else {
            //twoLevel = "baidu.com"  |  domain = "http://www.baidu.com"  (不变)
            var twoLevel = domain.substring(domain.indexOf(".") + 1);
            if ("__tip" == name) {
                let tipParam: string = NetworkUtil.getQueryString(name);
                if (tipParam && tipParam != '') {
                    return tipParam;
                }
                else {
                    return twoLevel;
                }
            }
            if ("oss" == name) {
                return "http://" + name + "." + twoLevel;
            }
            if ("download" == name) {
                return "http://down." + twoLevel;
            }
            if ("cus" == name) {
                const account = "aabbccdd"//DataManager.userInfo.m_sAccount;
                const acIcon = "head icon"//DataManager.userInfo.m_sHeadIcon;
                const isApp = false//DataManager.isApp;
                if (domain.indexOf("__tip") > -1) {
                    // return "http://chath5." + twoLevel;
                    return `http://chath5.${twoLevel}?ac=${account}&ut=${acIcon}${isApp ? "&ap=1" : ""}`
                } else {
                    //http://chath5.vbwus.com?__tip=chat.vbwus.com&ac=216212099&ut=http://oss.vbwus.com/icon_default/12.png
                    // return "http://chath5." + twoLevel + "?__tip=chat." + twoLevel;
                    return `http://chath5.${twoLevel}?__tip=chat.${twoLevel}&ac=${account}&ut=${acIcon}${isApp ? "&ap=1" : ""}`
                }
            }
            if ("share" == name) {
                return "http://fshare." + twoLevel + "/getOriginLinks";
            }
            if ("rechargeUrl" == name) {
                return "http://h5." + twoLevel;
            }
            return domain;
        }
    }

    /**从 URL 中提取并返回指定参数的值
     * @param name 参数名
     */
    static getQueryString(name: string): string | null {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义特殊字符
        const reg = new RegExp('(^|&)' + escapedName + '=([^&]*)(&|$)', 'i');
        const r = window.location.search.substring(1).match(reg);
        if (r != null) {
            return decodeURIComponent(r[2]);
        }
        return null; // 明确返回 null 表示没有找到匹配项
    }

    public static checkIp(ip: string): boolean {
        var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        if (ip && ip != null) {
            return reg.test(ip);
        }
        return false;
    }

    public static reLoad(): void {
        if (Browser.window.self === Browser.window.top) {
            Browser.window.location.reload();
        } else {
            Browser.window.parent.postMessage({ msg: 'reload' }, NetworkUtil.getParentDomain());
        }
    }

    public static guid() {
        return NetworkUtil.radomInt(0, 999999999).toString();
    }

    // 获取随机整数
    public static radomInt(minNum: number, maxNum: number): number {
        return (Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum);
    }

}