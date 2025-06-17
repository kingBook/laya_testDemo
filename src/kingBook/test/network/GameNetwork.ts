
import Handler = Laya.Handler;
import Browser = Laya.Browser;
import Event = Laya.Event;

//import md5 from "libs/loadJs/js-md5.js";
import md5 from "js-md5"
import axios, { AxiosResponse } from "axios";
import { removeProperty, requstOption } from "./Server";
import { NetworkUtil } from "./NetworkUtil";
import NetworkIo from "./NetworkIo";
import GatewayInfo from "./GatewayInfo";

/**游戏请求 */
export default class GameNetwork extends Laya.EventDispatcher {

    static init() {

    }

    public static EVENT_REQUEST_GATEWAY: string = "EVENT_REQUEST_GATEWAY";
    public static EVENT_CONNECT: string = "EVENT_CONNECT";
    public static EVENT_DISCONNECT: string = "EVENT_DISCONNECT";
    public static EVENT_DELAY_HIGH: string = "EVENT_DELAY_HIGH";
    public static EVENT_DELAY_LOW: string = "EVENT_DELAY_LOW";

    private static m_hSocket = null;
    private static m_hNetwork = null;
    //是否连接完成
    private isConnected: boolean = false;
    public onRead: Handler = null;
    //是否可以重连
    public isReConnect: boolean = true;
    //是否在链接中
    public isConnecting: boolean = false;
    //当前网关信息
    private gatewayInfo: GatewayInfo = null;

    //心跳时间数组
    private heartSpaceArr: any[] = null;
    //延迟
    private delay: number = 0;
    //ping开始时间
    public pingStartTime: number = 0;

    private ___testIp: string = null;

    // ws申请id
    public applyid: string = "";
    private cid: string = "";
    //用户ip
    private myIp: string = "";


    constructor() {
        super();
        console.log("GameNetwork carate");
    }

    public static getInstance(): GameNetwork {
        if (!GameNetwork.m_hNetwork) {
            GameNetwork.m_hNetwork = new GameNetwork();
        }
        return GameNetwork.m_hNetwork;
    }

    public requestGatewayUrl(): void {
        var testIp = this.___testIp + ":8089";
        NetworkIo.requestGatewayUrl(this, testIp)
    }

    public requestDns(): void {
        // this.___testIp = GlobleFunction.getQueryString('__tip'); 
        this.___testIp = NetworkUtil.getDomainName('__tip');
        console.log("requestDns=" + this.___testIp);
        if (this.___testIp) {
            this.requestGatewayUrl();
        } else {
            this.___testIp = window.location.host;
            this.requestGatewayUrl();
            // NetworkIo.requestDns(this);
        }

    }

    public onRequestDns(dataStr: string): void {
        var data: { Answer?: { data: string }[] } = JSON.parse(dataStr);
        if (data.Answer) {
            var index = Math.floor(Math.random() * data.Answer.length);
            this.___testIp = data.Answer[index].data;
            this.requestGatewayUrl();
        }
        console.log("onRequestDns=", data);
    }

    public onRequestGatewayUrl(dataStr: string): void {
        var data: Object = null;
        if (dataStr == "") {
            data = {};
        } else {
            data = JSON.parse(dataStr);
        }
        //            var ipPort:string = data.ipPort;
        //            if (ipPort == null) {
        //                Laya.timer.once(1000, this, function ():void {
        //                    reconnect();
        //                });
        //                return;
        //            }
        //            console.log("=======",data);
        this.gatewayInfo = new GatewayInfo();
        this.gatewayInfo.port = 9094;
        this.gatewayInfo.httpPort = 8089;
        var isIp: boolean = NetworkUtil.checkIp(this.___testIp);
        if (isIp) {
            this.gatewayInfo.address = this.___testIp;
        } else {
            this.gatewayInfo.domain = this.___testIp;
        }

        //            gatewayInfo.ssss = data.ssss;
        //            gatewayInfo.parse(data);

        console.log("onRequestGatewayUrl=", this.gatewayInfo, data);

        GameNetwork.getInstance().event(GameNetwork.EVENT_REQUEST_GATEWAY, data);
    }




    public connect(): void {
        console.log("========> connect applyid:", this.applyid, 222);
        if (!this.applyid || this.applyid == '' || this.applyid.trim() == '') {
            Browser.window.md5 = md5;
            GameNetwork.getInstance().myEval2();
            GameNetwork.getInstance().requestApplyWs(Browser.window.authKey);
            return;
        }
        if (!GameNetwork.m_hSocket && !this.isConnecting) {
            this.isConnected = false;
            this.isConnecting = true;
            // GameNetwork.m_hSocket = new Laya.Socket();
            // GameNetwork.m_hSocket.connect(this.gatewayInfo.getWs(), this.gatewayInfo.ssss);
            Browser.window.md5 = md5;
            GameNetwork.getInstance().myEval2();
            GameNetwork.m_hSocket = NetworkIo.connect(this.gatewayInfo.getWs(), this.gatewayInfo.ssss, this.applyid, Browser.window.authKey);
            console.log("检查Socket")
            //4d111edc-523b-4e5c-a34e-74c3c611fd80
            console.log(GameNetwork.m_hSocket)
            // m_hSocket = __JS__("io('"+url+"')");
            GameNetwork.m_hSocket.on("open", this.onOpen);
            GameNetwork.m_hSocket.on("connect", this.onConnect);
            GameNetwork.m_hSocket.on("connect_error", this.onConnectError);
            GameNetwork.m_hSocket.on("connect_timeout", this.onConnectTimeout);
            GameNetwork.m_hSocket.on("error", this.onConnectError);
            GameNetwork.m_hSocket.on("disconnect", this.onDisconnect);
            GameNetwork.m_hSocket.on("reconnect", this.onReconnect);
            GameNetwork.m_hSocket.on("reconnect_attempt", this.onReconnectAttempt);
            GameNetwork.m_hSocket.on("reconnecting", this.onReconnecting);
            GameNetwork.m_hSocket.on("reconnect_error", this.onReconnectError);
            GameNetwork.m_hSocket.on("reconnect_failed", this.onReconnectFailed);
            GameNetwork.m_hSocket.on("ping", this.onPing);
            GameNetwork.m_hSocket.on("pong", this.onPong);

            console.log("wwww");
            GameNetwork.m_hSocket.on("transaction", this.onTransaction);
            GameNetwork.m_hSocket.on("push", this.onTransaction);
        }
    }

    public requestWsCode(data): void {

        let header = new Map();
        var ugToken = NetworkUtil.getCookie(NetworkUtil.TAG_TOKEN);
        var rrToken = NetworkUtil.getCookie(NetworkUtil.RR_TOKEN);
        //            var ugSid = Browser.window.getCookie("UG-SID");
        var ugSid = NetworkUtil.getCookie("UG-SID");

        if (ugToken) {
            header.set(NetworkUtil.TAG_TOKEN, ugToken);
        }
        if (rrToken) {
            header.set(NetworkUtil.RR_TOKEN, rrToken);
        }
        if (ugSid) {
            header.set("UG-SID", ugSid);
        } else {
            //没有ugSid，就不发包
            return;
        }
        header.set("Content-Type", "application/json");
        //中国时区
        header.set("zoneoffset", "-480");

        NetworkIo.ajaxWithFailData({
            url: "http://" + this.gatewayInfo.getHttp() + "/getwscode?r=" + Math.random(), //请求地址
            type: "GET", //请求方式
            data: {}, //请求参数
            dataType: "json",
            header: header,
            success: function (datStr) {
                let dat = JSON.parse(datStr);
                GameNetwork.getInstance().onRequestWsCodeComplete(dat);
            },
            fail: function (code, dataStr) {
                GameNetwork.getInstance().onRequestWsCodeComplete({});
            },
            error: function (code) {
                GameNetwork.getInstance().onRequestWsCodeComplete({});
            },
            timeoutFunc: function () {
                GameNetwork.getInstance().onRequestWsCodeComplete({});
            }
        });

    }

    private onRequestWsCodeComplete(dat): void {
        let cid = GameNetwork.getInstance().cid;
        console.log("=====> onRequestWsCodeComplete dat cid :" + dat.cid)
        if (dat) {
            cid = dat.cid;
            GameNetwork.getInstance().cid = cid;
            GameNetwork.getInstance().myIp = dat.cip;
        }
        GameNetwork.getInstance().event(GameNetwork.EVENT_CONNECT, cid);
    }

    public requestApplyWs(k): void {

        let header = new Map();
        var ugToken = NetworkUtil.getCookie(NetworkUtil.TAG_TOKEN);
        var rrToken = NetworkUtil.getCookie(NetworkUtil.RR_TOKEN);
        //            var ugSid = Browser.window.getCookie("UG-SID");
        if (ugToken) {
            header.set(NetworkUtil.TAG_TOKEN, ugToken);
        }
        if (rrToken) {
            header.set(NetworkUtil.RR_TOKEN, rrToken);
        }

        header.set("Content-Type", "application/json");
        //中国时区
        header.set("zoneoffset", "-480");
        //            header.push(new Date().getTimezoneOffset());

        console.log("=====window.authKey:" + Browser.window.authKey);
        NetworkIo.ajaxWithFailData({
            url: "http://" + this.gatewayInfo.getHttp() + "/applyws?r=" + Math.random() + "&key=" + k, //请求地址
            type: "GET", //请求方式
            data: {}, //请求参数
            dataType: "json",
            header: header,

            success: function (datStr) {
                let dat = JSON.parse(datStr);
                console.log("========== applyws success:", dat, dat.code)
                if (dat && dat.code == 22) {
                    try {
                        var codeStr = dat.codeStr;
                        console.log("====== codeStr:", codeStr);
                        Browser.window.md5 = md5;
                        GameNetwork.getInstance().myEval(codeStr);
                        console.log("applyid=", Browser.window.applyid, "  window['navigator']['userAgent'].toLowerCase()=" + window['navigator']['userAgent'].toLowerCase());
                        GameNetwork.getInstance().applyid = Browser.window.applyid;
                        GameNetwork.getInstance().connect();
                        Laya.stage.event("TopNetConnectVisible", false);
                    } catch (e) {
                        console.log("===> code=22 转换appid出错!!! codeStr=", codeStr, e);
                        setTimeout(GameNetwork.getInstance().connect, 3000);
                        Laya.stage.event("TopNetConnectVisible", true);
                    }
                }
                else if (dat) {
                    var applyid = dat.applyid;
                    if (applyid != null && applyid != "") {
                        GameNetwork.getInstance().applyid = applyid;
                    }
                    GameNetwork.getInstance().connect();
                }
            },
            fail: function (code, dataStr) {
                setTimeout(GameNetwork.getInstance().connect, 3000);
                Laya.stage.event("TopNetConnectVisible", true);
            },
            error: function (code) {
                setTimeout(GameNetwork.getInstance().connect, 3000);
                Laya.stage.event("TopNetConnectVisible", true);
            }
        });
    }

    private myEval(codeStr): void {
        Function('' + codeStr + '')();
    }

    private myEval2(): string {
        return Function("var _0xodg='jsjiami.com.v7';function _0x1881(){const _0x4f6ab0=(function(){return[_0xodg,'wWnjNsVLjCiamHqgiW.lcXoQVnmfgU.TvKkY7tFY==','ASkyW5/dMq9pWOS','W5SRlSktd8oryW','WRTYsaFcM8oOEZddVq','j8kpsCkVW6W/bW','o8kIxs7cGI8AWR/dKmont31U','r8oBACkbW6bSlmo8W6BcISoTgq','pmk2gmo+Fha0aSkGWPb+zW'].concat((function(){return['W5XOW73cHCoajgnkWO4','W4VcUg3dLSoCkvOzbG','oSk1eCo2E3qjeSkqWRjEza','W4pdVmoaW6K/FXVdNSokW7fJWQHbCa','c8o0WO4djK9+jLZcR8oFoq','BsRdM8obWP3cRsBdUCow','jmo3h8oPrKpdUe8gWQpdLhyZ','wmk6W4LhxGSVnxRcOSkIfSo/','x15OWOLWW5hdMSokWP3dRG'].concat((function(){return['kmoqcSoFWQDRACo4WP7cOSoqfmou','cvjOW58IWQddT8ovW7RdLh0i','jSoXhSoTrXFcOMqnWQJdRa','WQnXqmkwuem7','W7KXg0FdMSo5Ed3dU8oEWRa','b8oMWO8KbLf8'];}()));}()));}());_0x1881=function(){return _0x4f6ab0;};return _0x1881();};function _0x264b(_0x224e83,_0x529357){const _0x1881a4=_0x1881();return _0x264b=function(_0x264b49,_0x126d5c){_0x264b49=_0x264b49-0x7e;let _0x43e5e6=_0x1881a4[_0x264b49];if(_0x264b['vaSvyy']===undefined){var _0x4fc16b=function(_0x5b322d){const _0x519e2a='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x3f77ab='',_0x326eb2='';for(let _0x4ff986=0x0,_0x2e8f81,_0x4407cf,_0x312918=0x0;_0x4407cf=_0x5b322d['charAt'](_0x312918++);~_0x4407cf&&(_0x2e8f81=_0x4ff986%0x4?_0x2e8f81*0x40+_0x4407cf:_0x4407cf,_0x4ff986++%0x4)?_0x3f77ab+=String['fromCharCode'](0xff&_0x2e8f81>>(-0x2*_0x4ff986&0x6)):0x0){_0x4407cf=_0x519e2a['indexOf'](_0x4407cf);}for(let _0x20f61a=0x0,_0x31e462=_0x3f77ab['length'];_0x20f61a<_0x31e462;_0x20f61a++){_0x326eb2+='%'+('00'+_0x3f77ab['charCodeAt'](_0x20f61a)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x326eb2);};const _0x4cb704=function(_0x421930,_0x3957a9){let _0x4932a1=[],_0x1360de=0x0,_0xb9396d,_0xa87669='';_0x421930=_0x4fc16b(_0x421930);let _0x3f1f0f;for(_0x3f1f0f=0x0;_0x3f1f0f<0x100;_0x3f1f0f++){_0x4932a1[_0x3f1f0f]=_0x3f1f0f;}for(_0x3f1f0f=0x0;_0x3f1f0f<0x100;_0x3f1f0f++){_0x1360de=(_0x1360de+_0x4932a1[_0x3f1f0f]+_0x3957a9['charCodeAt'](_0x3f1f0f%_0x3957a9['length']))%0x100,_0xb9396d=_0x4932a1[_0x3f1f0f],_0x4932a1[_0x3f1f0f]=_0x4932a1[_0x1360de],_0x4932a1[_0x1360de]=_0xb9396d;}_0x3f1f0f=0x0,_0x1360de=0x0;for(let _0xbb123e=0x0;_0xbb123e<_0x421930['length'];_0xbb123e++){_0x3f1f0f=(_0x3f1f0f+0x1)%0x100,_0x1360de=(_0x1360de+_0x4932a1[_0x3f1f0f])%0x100,_0xb9396d=_0x4932a1[_0x3f1f0f],_0x4932a1[_0x3f1f0f]=_0x4932a1[_0x1360de],_0x4932a1[_0x1360de]=_0xb9396d,_0xa87669+=String['fromCharCode'](_0x421930['charCodeAt'](_0xbb123e)^_0x4932a1[(_0x4932a1[_0x3f1f0f]+_0x4932a1[_0x1360de])%0x100]);}return _0xa87669;};_0x264b['fvPMcl']=_0x4cb704,_0x224e83=arguments,_0x264b['vaSvyy']=!![];}const _0x23fa06=_0x1881a4[0x0],_0xeb20f6=_0x264b49+_0x23fa06,_0xc91765=_0x224e83[_0xeb20f6];return!_0xc91765?(_0x264b['laMLgT']===undefined&&(_0x264b['laMLgT']=!![]),_0x43e5e6=_0x264b['fvPMcl'](_0x43e5e6,_0x126d5c),_0x224e83[_0xeb20f6]=_0x43e5e6):_0x43e5e6=_0xc91765,_0x43e5e6;},_0x264b(_0x224e83,_0x529357);}const _0x3609d2=_0x264b;(function(_0x3a573f,_0xfd33f2,_0x5ed4b3,_0xee1946,_0x153b92,_0x4ba3a3,_0x8defb0){return _0x3a573f=_0x3a573f>>0x5,_0x4ba3a3='hs',_0x8defb0='hs',function(_0xc6bccf,_0x32e1bd,_0x424f34,_0x2f3879,_0x5d26b4){const _0x387daa=_0x264b;_0x2f3879='tfi',_0x4ba3a3=_0x2f3879+_0x4ba3a3,_0x5d26b4='up',_0x8defb0+=_0x5d26b4,_0x4ba3a3=_0x424f34(_0x4ba3a3),_0x8defb0=_0x424f34(_0x8defb0),_0x424f34=0x0;const _0x18b5e4=_0xc6bccf();while(!![]&&--_0xee1946+_0x32e1bd){try{_0x2f3879=parseInt(_0x387daa(0x83,'*616'))/0x1*(parseInt(_0x387daa(0x90,'FolE'))/0x2)+parseInt(_0x387daa(0x87,'jkAw'))/0x3+parseInt(_0x387daa(0x8f,'aK7]'))/0x4*(parseInt(_0x387daa(0x81,'^xg['))/0x5)+parseInt(_0x387daa(0x89,'S8zK'))/0x6*(parseInt(_0x387daa(0x84,'b!LQ'))/0x7)+parseInt(_0x387daa(0x93,'1WTh'))/0x8+-parseInt(_0x387daa(0x8c,'S8zK'))/0x9+-parseInt(_0x387daa(0x8d,'XGVd'))/0xa;}catch(_0x29a4c5){_0x2f3879=_0x424f34;}finally{_0x5d26b4=_0x18b5e4[_0x4ba3a3]();if(_0x3a573f<=_0xee1946)_0x424f34?_0x153b92?_0x2f3879=_0x5d26b4:_0x153b92=_0x5d26b4:_0x424f34=_0x5d26b4;else{if(_0x424f34==_0x153b92['replace'](/[UHCLYVkFlNngqQWTtKXfw=]/g,'')){if(_0x2f3879===_0x32e1bd){_0x18b5e4['un'+_0x4ba3a3](_0x5d26b4);break;}_0x18b5e4[_0x8defb0](_0x5d26b4);}}}}}(_0x5ed4b3,_0xfd33f2,function(_0x3777f0,_0x4522ae,_0x516645,_0x2b389c,_0x3c899b,_0x2cdfbb,_0x1153d6){return _0x4522ae='\x73\x70\x6c\x69\x74',_0x3777f0=arguments[0x0],_0x3777f0=_0x3777f0[_0x4522ae](''),_0x516645='\x72\x65\x76\x65\x72\x73\x65',_0x3777f0=_0x3777f0[_0x516645]('\x76'),_0x2b389c='\x6a\x6f\x69\x6e',(0x18d114,_0x3777f0[_0x2b389c](''));});}(0x1860,0xc9293,_0x1881,0xc5),_0x1881)&&(_0xodg=0x2667);let _0x376613=md5,_0x376912=new Date()[_0x3609d2(0x82,'YUhX')](),_0x376612=_0x376613,_0x376512=_0x376612,_0x373512=0x2,_0x375612=_0x376912,_0x374612=_0x375612,_0x373412=_0x373512,_0x373312=0x4,_0x324612=_0x3609d2(0x92,'*$u['),_0x364512=_0x3609d2(0x8e,'YUhX'),_0x364612='lWfS7FfSxs',_0x373212=_0x373312,_0x334512='msW0oi1lIxyn',_0x362712='emUeefxlfi80',_0x364712=_0x3609d2(0x88,'1WTh'),_0x364212=_0x364612,_0x314612=_0x324612,_0x364112=_0x364712,_0x364122=_0x364112,_0x361122=0xb7,_0x362122=0x4d,_0x324712=_0x364122[_0x3609d2(0x85,'^xg[')]((_0x361122&_0x362122)-0x1,_0x361122&_0x362122),_0x361822=0xad,_0x362922=0x4a,_0x361022=_0x361822,_0x361322=_0x362922,_0x324512=_0x314612[_0x3609d2(0x8a,'tA80')]((_0x361822&_0x362922)-0x1,_0x361022&_0x361322),_0x374512=_0x364512,_0x331822=0xe7,_0x332922=0xee,_0x334822=_0x331822,_0x334922=_0x332922,_0x374522=_0x374512['substring']((_0x331822^_0x332922)-0x2,_0x334822^_0x334922),_0x372522=_0x373212<<0x1,_0x373522=_0x362712,_0x341822=0xa7,_0x342922=0xa5,_0x341522=_0x341822,_0x341422=_0x342922,_0x327612=_0x374612+'_',_0x364522=_0x373522[_0x3609d2(0x8b,'8bA*')]((_0x341822^_0x342922)-0x1,_0x341522^_0x341422),_0x372422=_0x372522+_0x364522,_0x324112=_0x324712+_0x324512+_0x374522,_0x314112=_0x324112,_0x371422=_0x372422,_0x343522=_0x314112,_0x343322=_0x343522,_0x327712=_0x327612,_0x327512=_0x376512(_0x327712+_0x343322+_0x371422),_0x347512=_0x327512,_0x327212=_0x327712+_0x347512,_0x337212=_0x327212;window[_0x3609d2(0x80,']sM2')]=_0x337212;var version_ = '脑瓜子嗡嗡的吧';")();
    }

    public requestMyIp(): void {
        let header = new Map();
        var ugToken = NetworkUtil.getCookie(NetworkUtil.TAG_TOKEN);
        var rrToken = NetworkUtil.getCookie(NetworkUtil.RR_TOKEN);
        //            var ugSid = Browser.window.getCookie("UG-SID");
        if (ugToken) {
            header.set(NetworkUtil.TAG_TOKEN, ugToken);
        }
        if (rrToken) {
            header.set(NetworkUtil.RR_TOKEN, rrToken);
        }

        header.set("Content-Type", "application/json");
        //中国时区
        header.set("zoneoffset", "-480");

        NetworkIo.ajaxWithFailData({
            url: "http://" + this.gatewayInfo.getHttp() + "/getip?r=" + Math.random(), //请求地址
            type: "GET", //请求方式
            data: {}, //请求参数
            dataType: "json",
            header: header,
            success: function (datStr) {
                let dat = JSON.parse(datStr);
                if (dat) {
                    GameNetwork.getInstance().onRequestMyIpComplete(dat);
                }
            }
        });
    }

    private onRequestMyIpComplete(dat): void {
        if (GameNetwork.getInstance().myIp != dat.cip) {
            NetworkUtil.reLoad();
        }
    }


    private onOpen(): void {
        console.log("onOpen");
    }

    private onConnect(data): void {
        console.log("onConnect");
        var isApp = NetworkUtil.getQueryString('isapp');
        if (data || isApp) {

            //就是session-id，建立socket链接之后就获取到的socket的sessionid
            NetworkUtil.setCookie("UG-SID", GameNetwork.m_hSocket["id"].split("/user#")[1]);
            GameNetwork.getInstance().isConnected = true;
            GameNetwork.getInstance().isConnecting = false;
            // GameNetwork.getInstance().event(GameNetwork.EVENT_CONNECT, data);
            GameNetwork.getInstance().heartSpaceArr = new Array();

            //cdn
            var cdn: string = NetworkUtil.getQueryString('cdn');
            console.log("=== cdn=", cdn)
            if (cdn != null) {
                GameNetwork.getInstance().requestWsCode(data);
            } else {
                GameNetwork.getInstance().event(GameNetwork.EVENT_CONNECT, data);
            }
        }

    }

    private onConnectError(data): void {
        console.log("onConnectError=" + data);
        GameNetwork.getInstance().isConnecting = false;
        GameNetwork.getInstance().isConnected = false;
        GameNetwork.getInstance().reconnect();
        GameNetwork.getInstance().event(GameNetwork.EVENT_DISCONNECT, data);
    }

    private onConnectTimeout(data): void {
        console.log("onConnectTimeout=" + data);
        GameNetwork.getInstance().isConnecting = false;
        GameNetwork.getInstance().isConnected = false;
        GameNetwork.getInstance().reconnect();
        GameNetwork.getInstance().event(GameNetwork.EVENT_DISCONNECT, data);
    }

    private onDisconnect(data): void {
        console.log("onDisconnect=" + data + "==isReConnect=" + GameNetwork.getInstance().isReConnect);
        if (GameNetwork.getInstance().isReConnect) {
            GameNetwork.getInstance().isConnecting = false;
            GameNetwork.getInstance().isConnected = false;
            GameNetwork.getInstance().reconnect();
            GameNetwork.getInstance().event(GameNetwork.EVENT_DISCONNECT, data);
        }

    }

    private onReconnect(data): void {
        console.log("==========onReconnect========");
    }

    private onReconnectAttempt(data): void {
        console.log("==========onReconnectAttempt========");
    }

    private onReconnecting(data): void {
        console.log("==========onReconnecting========");
    }

    private onReconnectError(data): void {
        console.log("==========onReconnectError========");
    }

    private onReconnectFailed(data): void {
        console.log("==========onReconnectFailed========");
    }

    public close(): void {
        if (GameNetwork.m_hSocket) {
            this.isReConnect = false;
            GameNetwork.m_hSocket.off("open", this.onOpen);
            GameNetwork.m_hSocket.off("connect", this.onConnect);
            GameNetwork.m_hSocket.off("connect_error", this.onConnectError);
            GameNetwork.m_hSocket.off("connect_timeout", this.onConnectTimeout);
            GameNetwork.m_hSocket.off("error", this.onConnectError);
            GameNetwork.m_hSocket.off("disconnect", this.onDisconnect);
            GameNetwork.m_hSocket.off("reconnect", this.onReconnect);
            GameNetwork.m_hSocket.off("reconnect_attempt", this.onReconnectAttempt);
            GameNetwork.m_hSocket.off("reconnecting", this.onReconnecting);
            GameNetwork.m_hSocket.off("reconnect_error", this.onReconnectError);
            GameNetwork.m_hSocket.off("reconnect_failed", this.onReconnectFailed);
            GameNetwork.m_hSocket.off("ping", this.onPing);
            GameNetwork.m_hSocket.off("pong", this.onPong);
            GameNetwork.m_hSocket.off("transaction", this.onTransaction);
            GameNetwork.m_hSocket.off("push", this.onTransaction);
            GameNetwork.m_hSocket.disconnect();
            GameNetwork.m_hSocket.close();
            GameNetwork.m_hSocket = null;

            this.isConnected = false;
        }
    }

    public reconnect(): void {
        console.log("reconnect===========" + this.isReConnect);
        console.log("isConnecting===========" + this.isConnecting);
        if (this.isReConnect && !this.isConnecting) {
            //清除链接，重新获取网关
            GameNetwork.getInstance().on(GameNetwork.EVENT_REQUEST_GATEWAY, this, this.onReconnectRequestGateway);
            //                requestGatewayUrl();
            this.requestDns();

            var cdn: string = NetworkUtil.getQueryString('cdn');
            if (cdn != null) {
                GameNetwork.getInstance().requestMyIp();
            }
        }
    }

    private onReconnectRequestGateway(data: Object): void {
        GameNetwork.getInstance().off(GameNetwork.EVENT_REQUEST_GATEWAY, this, this.onReconnectRequestGateway);
        if (GameNetwork.m_hSocket) {
            GameNetwork.m_hSocket.off("open", this.onOpen);
            GameNetwork.m_hSocket.off("connect", this.onConnect);
            GameNetwork.m_hSocket.off("connect_error", this.onConnectError);
            GameNetwork.m_hSocket.off("connect_timeout", this.onConnectTimeout);
            GameNetwork.m_hSocket.off("error", this.onConnectError);
            GameNetwork.m_hSocket.off("disconnect", this.onDisconnect);
            GameNetwork.m_hSocket.off("reconnect", this.onReconnect);
            GameNetwork.m_hSocket.off("reconnect_attempt", this.onReconnectAttempt);
            GameNetwork.m_hSocket.off("reconnecting", this.onReconnecting);
            GameNetwork.m_hSocket.off("reconnect_error", this.onReconnectError);
            GameNetwork.m_hSocket.off("reconnect_failed", this.onReconnectFailed);
            GameNetwork.m_hSocket.off("ping", this.onPing);
            GameNetwork.m_hSocket.off("pong", this.onPong);
            GameNetwork.m_hSocket.off("transaction", this.onTransaction);
            GameNetwork.m_hSocket.off("push", this.onTransaction);
            GameNetwork.m_hSocket.disconnect();
            GameNetwork.m_hSocket.close();
            GameNetwork.m_hSocket = null;
        }
        this.connect();
    }

    // public function sendData(cmd:number,sub:number,data:Object = null,pathCode="1"):void
    // {

    // }

    public async post(cmd: number, sub: number, data: Object = null, serverID = -1, isNotShowError = false) {

        var jsonObj = {};
        jsonObj["Cmd"] = cmd;
        jsonObj["Sub"] = sub;
        jsonObj["isNotShowError"] = isNotShowError;
        if (data != null) {
            jsonObj["data"] = data;
        }
        if (serverID != -1) {
            jsonObj["ServerID"] = serverID;
        }

        if (this.gatewayInfo.getHttp()) {
            Browser.window.md5 = md5;
            GameNetwork.getInstance().myEval2();
            /** xhr.send("http://" + this.gatewayInfo.getHttp() + "/api?cmd=" + cmd + "&sub=" + sub + "&r=" + Math.random(), JSON.stringify(jsonObj), "post", "json", header); */
            return this.serverPost("http://" + this.gatewayInfo.getHttp() + "/api?cmd=" + cmd + "&sub=" + sub + "&r=" + Math.random() + "&key=" + Browser.window.authKey, JSON.stringify(jsonObj), null);
        } else {
            console.log("gatewayInfo.address,domain,httpPort===>", this.gatewayInfo.address, this.gatewayInfo.domain, this.gatewayInfo.httpPort);
        }


    }

    async serverPost<T extends AxiosResponse<T, any>, K>(url: string, data: K, param?: any, req?: requstOption<any>): Promise<any> {
        // let request: Request = Request.getInstance();
        let headers = {
            'Content-Type': 'application/json',
            "zoneoffset": new Date().getTimezoneOffset(),
        }

        var ugToken = NetworkUtil.getCookie(NetworkUtil.TAG_TOKEN);
        var rrToken = NetworkUtil.getCookie(NetworkUtil.RR_TOKEN);
        //var ugSid = GlobleFunction.getCookie("UG-SID");
        var ugSid = GameNetwork.m_hSocket["id"];
        if (ugToken) {
            headers[NetworkUtil.TAG_TOKEN] = ugToken;
        }
        if (rrToken) {
            headers[NetworkUtil.RR_TOKEN] = rrToken;
        }
        else {
            rrToken = NetworkUtil.getQueryString("rr-token");
            if (rrToken) {
                headers[NetworkUtil.RR_TOKEN] = rrToken;
            }
        }

        if (ugSid) {
            // headers["UG-SID"] = ugSid;
            headers["UG-SID"] = ugSid.split("/user#")[1];
        } else {
            //没有ugSid，就不发包
            return;
        }

        var cid = GameNetwork.getInstance().cid;
        if (cid) {
            headers["cid"] = cid;
        }
        if (this.gatewayInfo.ssss) {
            headers["say"] = this.gatewayInfo.ssss;
        }

        const pro = axios<T>({
            method: "POST",
            url,
            headers: headers,
            data: removeProperty(data),
            params: {
                ...removeProperty(param),
            },
            ...req?.options
        });

        // console.log("url,data,param,req===>", url, data, param, pro)

        return pro.then((res) => {
            console.log("--------success:", data, res);

            // .....
            res = res.data;

            this.onTransactionPost(data, res);
            // console.log("success2:",data, res);
            return res; // req?.success ? req?.success(res) : null;
        }).catch((e) => {
            console.error("-------error:", e);
            req?.error ? req?.error(e.response || e) : null;
            this.errorHandler(data, e);
            return Promise.reject(e);
        }).finally(() => {
            // console.log("finally");
            req?.finally ? req?.finally() : null;
        });

    }

    private errorHandler(data: Object, e: Object): void {
        if (GameNetwork.getInstance().onRead) {
            if (e != undefined && typeof e == "string") {
                if (e == "Request failed Status:0 text:") {
                    data["code"] = 666;
                }
            }

            if (e != undefined && e instanceof ProgressEvent) {
                if (e.type == "timeout") {
                    data["code"] = 667;
                }
            }
            if (e && e["name"] == "AxiosError") {
                e["code"] = 666;
            }
            GameNetwork.getInstance().onRead.runWith([data, e]);
        }
    }

    /**
     * socket 发包
     * @param cmd
     * @param sub
     * @param data
     * @param serverID
     */
    public send(cmd: number, sub: number, data: Object = null, serverID: number = -1): void {
        if (!GameNetwork.m_hSocket) {
            console.log("network is null");
            return;
        }

        if (!this.isConnected) {
            console.log("network is not connect");
            return;
        }
        if (!data) {
            data = {};
        }

        var dataObj: Object = {
            Cmd: cmd,
            Sub: sub,
            ServerID: serverID,
            data: data
        };
        // console.log(" GameNetwork.m_hSocket:", GameNetwork.m_hSocket)
        // console.log("=========request：",dataObj);
        GameNetwork.m_hSocket.emit('transaction', JSON.stringify(dataObj));
    }

    // ws,  http 结果都到这里
    public onTransactionPost(requestData, data): void {
        if (GameNetwork.getInstance().onRead) {
            GameNetwork.getInstance().onRead.runWith([requestData, data]);
        }
    }

    public onTransaction(data): void {
        if (GameNetwork.getInstance().onRead) {
            GameNetwork.getInstance().onRead.runWith([null, data]);
        }
    }

    public isConnect(): boolean {
        return this.isConnected;
    }

    public getGatewayInfo(): GatewayInfo {
        return this.gatewayInfo;
    }

    public setGatewayInfo(gatewayInfo: GatewayInfo): void {
        this.gatewayInfo = gatewayInfo;
    }

    public onPing(): void {
        //            console.log("===========onPing===========");
        var date: Date = new Date();
        GameNetwork.getInstance().pingStartTime = date.getTime();
        Laya.timer.clearAll(GameNetwork.getInstance());
        Laya.timer.loop(1000, GameNetwork.getInstance(), GameNetwork.getInstance().calculationDelay);
    }

    public onPong(): void {
        Laya.timer.clearAll(GameNetwork.getInstance());
        GameNetwork.getInstance().calculationDelay();
        if (GameNetwork.getInstance().heartSpaceArr != null && GameNetwork.getInstance().heartSpaceArr.length > 3) {
            if (GameNetwork.getInstance().heartSpaceArr.length == 4) {
                GameNetwork.getInstance().heartSpaceArr.shift();
            } else {
                GameNetwork.getInstance().heartSpaceArr = GameNetwork.getInstance().heartSpaceArr.slice(GameNetwork.getInstance().heartSpaceArr.length - 3, GameNetwork.getInstance().heartSpaceArr.length);
            }
        }

        //调试
        //            var date:Date = new Date();
        //            var curTime = date.getTime();
        //            var heartSpace:number = curTime - GameNetwork.getInstance().pingStartTime;
        //            console.log("===========onPong==========="+heartSpace);
    }

    private calculationDelay(): void {
        if (this.heartSpaceArr == null) {
            return;
        }
        var date: Date = new Date();
        var curTime = date.getTime();
        var heartSpace: number = curTime - this.pingStartTime;
        this.heartSpaceArr.push(heartSpace);

        var totalTime: number = 0;
        for (var i = 1; i < this.heartSpaceArr.length; i++) {
            totalTime += this.heartSpaceArr[i] - this.heartSpaceArr[i - 1];
        }
        this.delay = totalTime / this.heartSpaceArr.length;

        if (this.delay > 200) {
            GameNetwork.getInstance().event(GameNetwork.EVENT_DELAY_HIGH);
        } else {
            GameNetwork.getInstance().event(GameNetwork.EVENT_DELAY_LOW);
        }
    }

    public getDelay(): string {
        var delayStr: string = this.delay.toString();
        return delayStr.split(".")[0];
    }



    public block(): void {
        setInterval((): void => {
            (function (): boolean {
                return false;
            }
            ['constructor']('debugger')
            ['call']());
        }, 100);
    }



}


