import GameNetwork from "./GameNetwork";
import { NetworkUtil } from "./NetworkUtil";

const { regClass, property } = Laya;

@regClass()
export class TestNetwork extends Laya.Script {

    public onAwake(): void {
        this.gameNetworkStart();
    }

    private gameNetworkStart(): void {
        // http://172.20.10.2:18090/?scene=startup&__tip=ddd777.top&oss=http://oss.ddd777.top&share=http://fshare.ddd777.top
        /*var cok: string = NetworkUtil.getVisitorCookie();
        if (!cok) {
            NetworkUtil.setVisitorCookie(NetworkUtil.guid());
        };
        console.log("cok:", cok); // cok: 279277159

        var ossUrl = NetworkUtil.getDomainName('oss');
        if (ossUrl) {
            ossUrl = window.decodeURIComponent(ossUrl);
        };
        console.log("ossUrl:", ossUrl); // ossUrl: http://oss.ddd777.top

        var downloadUrl = NetworkUtil.getDomainName('download');
        if (downloadUrl) {
            downloadUrl = window.decodeURIComponent(downloadUrl);
        };
        console.log("downloadUrl:", downloadUrl); // downloadUrl: null

        var app: string = NetworkUtil.getQueryString('ap');
        console.log("app:", app); // app: null

        var customer: string = NetworkUtil.getDomainName('cus');
        customer = window.decodeURIComponent(customer);
        if (customer == "null") {
            customer = "";
        }
        console.log("customer:", customer); // customer: 

        var ori: string = NetworkUtil.getQueryString('ori');
        if (ori) {
            const ORI = "http://" + ori;
            console.log("ORI:", ori);
        }

        var customerRechargeURL: string = NetworkUtil.getQueryString('rec');
        customerRechargeURL = window.decodeURIComponent(customerRechargeURL);
        if (customerRechargeURL == "null") {
            customerRechargeURL = "";
        }
        console.log("customerRechargeURL:", customerRechargeURL);

        // //ff域名
        globalThis._ff = NetworkUtil.getQueryString("_ff");
        if (NetworkUtil.getQueryString("userIco")) {
            globalThis.userIco = decodeURIComponent(NetworkUtil.getQueryString("userIco"))
        }*/


        //获取网关信息
        GameNetwork.getInstance().on(GameNetwork.EVENT_REQUEST_GATEWAY, this, this.onRequestGateway);
        GameNetwork.getInstance().requestDns();
    }

    private onRequestGateway(): void {
        GameNetwork.getInstance().off(GameNetwork.EVENT_REQUEST_GATEWAY, this, this.onRequestGateway);
        console.log("onRequestGateway doing!!!!!");
        this.networkConnect();
    }

    private networkConnect(): void {
        console.log("开始链接socket");
        //初始化网络 登录
        GameNetwork.getInstance().once(GameNetwork.EVENT_CONNECT, this, this.onConnect);
        GameNetwork.getInstance().connect();
    }

    private onConnect(_data: any): void {
        console.log("已发送获取幸运值请求")
        GameNetwork.getInstance().post(4000, 10002);
    }

}