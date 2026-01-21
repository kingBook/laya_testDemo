import io from "socket.io-client"; 
import { NetworkUtil } from "./NetworkUtil";


export default class NetworkIo {

    //格式化参数
    static formatParams(data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        return data ? arr.join("&") : null;
    };

    static ajax(options) {
        options = options || {};
        options.type = (options.type || "GET").toUpperCase();
        options.dataType = options.dataType || "json";
        var params = NetworkIo.formatParams(options.data);

        //创建 - 非IE6 - 第一步
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else { //IE6及其以下版本浏览器
            var xhr = new ActiveXObject("Microsoft.XMLHTTP") as XMLHttpRequest;
        };

        //接收 - 第三步
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status >= 200 && status < 300) {
                    var cookie = xhr.getAllResponseHeaders();
                    var isSss = cookie.indexOf("ssss:");
                    if (isSss > -1) {
                        var carr = cookie.split("ssss: ");
                        var obj = JSON.parse(xhr.responseText);
                        obj.ssss = carr[1].replace(/\r\n/g, "");
                        var s = JSON.stringify(obj);
                        options.success && options.success(s, xhr.responseXML);
                        return;
                    }
                    options.success && options.success(xhr.responseText, xhr.responseXML);
                } else {
                    options.fail && options.fail(status);
                }
            }
        };

        //连接 和 发送 - 第二步
        if (options.type == "GET") {
            xhr.open("GET", options.url + (params ? (options.url.indexOf("?") > -1 ? "&" : "?") : "") + (params || ""), options.async == undefined ? true : options.async);
            xhr.send(null);
        } else if (options.type == "POST") {
            xhr.open("POST", options.url, options.async == undefined ? true : options.async);
            //设置表单提交时的内容类型
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(params);
        }
    };

    static ajaxWithFailData(options) {
        options = options || {};
        options.type = (options.type || "GET").toUpperCase();
        options.dataType = options.dataType || "json";
        var params = NetworkIo.formatParams(options.data);

        //创建 - 非IE6 - 第一步
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else { //IE6及其以下版本浏览器
            var xhr = new ActiveXObject("Microsoft.XMLHTTP") as XMLHttpRequest;
        };
        xhr.timeout = 10000;
        if (options.timeoutFunc){
            xhr.ontimeout = () => {
                options.timeoutFunc();
            };
        }
        //接收 - 第三步
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status >= 200 && status < 300) {
                    var cookie = xhr.getAllResponseHeaders();
                    var isSss = cookie.indexOf("ssss:");
                    if (isSss > -1) {
                        var carr = cookie.split("ssss: ");
                        var obj = JSON.parse(xhr.responseText);
                        obj.ssss = carr[1].replace(/\r\n/g, "");
                        var s = JSON.stringify(obj);
                        options.success && options.success(s, xhr.responseXML);
                        return;
                    }
                    options.success && options.success(xhr.responseText, xhr.responseXML);
                } else {
                    options.fail && options.fail(status, xhr.responseText);
                }
            }
        };

        //连接 和 发送 - 第二步
        if (options.type == "GET") {
            xhr.open("GET", options.url + (params ? (options.url.indexOf("?") > -1 ? "&" : "?") : "") + (params || ""), options.async == undefined ? true : options.async);
            if (options.header){
                for (const [key, value] of options.header.entries()) {
                    // console.log(key, value);
                    xhr.setRequestHeader(key, value);
                }
            }
            xhr.send(null);
        } else if (options.type == "POST") {
            xhr.open("POST", options.url, options.async == undefined ? true : options.async);
            //设置表单提交时的内容类型
            // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            if (options.header){
                for (const [key, value] of options.header.entries()) {
                    // console.log(key, value);
                    xhr.setRequestHeader(key, value);
                }
            }
            xhr.send(params);
        }
    };

    static requestDns(callBackObj) {
        NetworkIo.ajax({
            url: "http://dns.alidns.com/resolve?name=www.dkasjbkjbwh.com.&type=1", //请求地址
            type: "GET", //请求方式
            data: {}, //请求参数
            dataType: "text",
            success: function (data) {
                let dat = JSON.parse(data);
                if (dat) {
                    if (callBackObj) {
                        callBackObj.onRequestDns(data);
                    }
                }
                else {
                    setTimeout(function () {
                        NetworkIo.requestDns(callBackObj);
                    }, 3000);
                }

            },
            fail: function () {
                setTimeout(function () {
                    NetworkIo.requestDns(callBackObj);
                }, 3000);
            }
        });
    }

    static requestGatewayUrl(callBackObj, ___testIp) {
        // var ___testIp = getQueryString("__tip");
        // var rightIp = localStorage.getItem("nettyIp");
        // var adCode = localStorage.getItem("adCode");
        // var clusterId = getQueryString("clusterId");
        // console.log("========",___testIp);
        callBackObj.onRequestGatewayUrl("");
        return;
    }

    static connect(ipPort, ssss, applyid, authKey) {
        globalThis._baseNettyUrl = "http://" + ipPort + "/user?secretKey=9QcjkitLxTbSP4mY&key="+authKey;

        var nmb = NetworkUtil.getCookie("XB_TOKEN");
        console.log("检查NMB===" + nmb)
        // var _socketIO  = new Laya.Socket();
        // _socketIO.connect(globalThis._baseNettyUrl + "&nmb=" + nmb + "&ssss=" + ssss,ipPort);
        var _socketIO = io.connect(globalThis._baseNettyUrl + "&nmb=" + nmb + "&ssss=" + ssss + "&applyid="+applyid, { forceNew: true, "transports": ['websocket'], reconnection: false });
        return _socketIO;
    }

}