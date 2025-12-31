const { regClass, property } = Laya;

// 需要在 https 环境下测试，普通 IP 访问无效。
// 做好兼容性，Chrome 不支持 DeviceOrientationEvent 对象
// 如果记住选项后，需要从设置中清楚 safari 浏览数据，才能重新测试
@regClass()
export class TestGyroscope extends Laya.Script {

    @property({ type: Laya.Button, private: false })
    private _btnStart: Laya.Button;

    @property({ type: Laya.Label, private: false })
    private _label: Laya.Label;

    @property({ type: Laya.Label, private: false })
    private _errLabel: Laya.Label;

    onAwake(): void {
        this._btnStart.clickHandler = new Laya.Handler(this, this.onClickBtnStart);
    }

    private onClickBtnStart(): void {
        this.addDeviceorientationListener();
    }

    private addDeviceorientationListener(): void {
        console.log("addDeviceorientationListener");
        this._errLabel.text += `addDeviceorientationListener\n`;

        const deviceMotionEvt: any = Laya.Browser.window.DeviceMotionEvent;
        if (!deviceMotionEvt) {
            console.error("暂时不支持");
            this._errLabel.text += `暂时不支持\n`;
        } else if (deviceMotionEvt.requestPermission) {
            deviceMotionEvt.requestPermission().then(permissionState => {
                console.log("permissionState:", permissionState);
                this._errLabel.text += `permissionState: ${permissionState}\n`;

                if (permissionState === "granted") { // 允许
                    Laya.Gyroscope.instance.on(Laya.Event.CHANGE, this, this.onDeviceorientation);
                    Laya.Browser.window.addEventListener("deviceorientation", this.handleOrientation, true);
                } else if (permissionState === "denied") { //拒绝

                }
            }).catch(err => {
                console.error("请求权限出错：", err);
                this._errLabel.text += `请求权限出错：\n`;
            });
        } else {
            console.log("无 requestPermission 方法");
            this._errLabel.text += `无 requestPermission 方法\n`;
            //Laya.Gyroscope.instance.on(Laya.Event.CHANGE, this, this.onDeviceorientation);
            //Laya.Browser.window.addEventListener("deviceorientation", this.handleOrientation, true);
        }
    }

    private handleOrientation(orientData) {
        const absolute = orientData.absolute;
        const alpha = orientData.alpha;
        const beta = orientData.beta;
        const gamma = orientData.gamma;

        this._label.text =
            "alpha1:" + Math.floor(alpha) + '\n' +
            "beta1 :" + Math.floor(beta) + '\n' +
            "gamma1:" + Math.floor(gamma) + '\n';
    }

    private onDeviceorientation(absolute: Boolean, rotationInfo: Laya.RotationInfo): void {
        this._label.text =
            "alpha:" + Math.floor(rotationInfo.alpha) + '\n' +
            "beta :" + Math.floor(rotationInfo.beta) + '\n' +
            "gamma:" + Math.floor(rotationInfo.gamma) + '\n';
    }
}