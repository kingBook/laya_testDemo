import { CollapsibleBar } from "./CollapsibleBar";

const { regClass, property } = Laya;

@regClass()
export class CollapsibleBarRight extends Laya.Script {

    private _iconNames: Array<string> = ["任务", "背包", "邮件"];

    @property({ type: [Laya.Texture2D], private: false })
    private _icons: Array<Laya.Texture2D>;

    private _collapBar: CollapsibleBar;

    onAwake(): void {
        this._collapBar = this.owner.getComponent(CollapsibleBar);

        this._collapBar.list.repeatX = 1;
        this._collapBar.list.repeatY = 1;

        let datas: Array<any> = [];
        for (let i = 0; i < this._icons.length; i++) {
            datas[i] = {
                Button: { skin: this._icons[i].url },
                roundRect: { visible: false },
                Label: { text: this._iconNames[i] }
            };
        }
        this._collapBar.list.array = datas;

    }
}