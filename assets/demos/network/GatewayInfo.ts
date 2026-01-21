
/**网关信息类   */
export default class GatewayInfo {
    public address: string = null;
    public domain: string = null;
    public httpPort: number = -1;
    public ipPort: string = null;
    public port: number = -1;
    public serverID: number = -1;
    public serverType: number = -1;
    public ssss: number = null;

    public parse(obj: any): void {
        this.address = obj.address;
        this.domain = obj.domain;
        this.httpPort = obj.httpPort;
        this.ipPort = obj.ipPort;
        this.port = obj.port;
        this.serverID = obj.serverID;
        this.serverType = obj.serverType;
        this.ssss = obj.ssss;
    }

    public getHttp(): string {
        if (this.domain && this.domain.length > 0) {
            return "ws." + this.domain;
        }
        if (this.address && this.address.length > 0) {
            return this.address + ":" + this.httpPort;
        }
        return "";
    }

    public getWs(): string {
        if (this.domain && this.domain.length > 0) {
            return "ws." + this.domain;
        }
        return this.address + ":" + this.port;
    }
}
