import { CollapsibleBar } from "./CollapsibleBar";

const { regClass, property } = Laya;

@regClass()
export class CollapsibleBarLeft extends Laya.Script {

    private _iconNames: Array<string> = ["贸易港", "活动", "首充礼包", "结缘之语", "天外来客"];

    @property({ type: [Laya.Texture2D], private: false })
    private _icons: Array<Laya.Texture2D>;

    private _collapBar: CollapsibleBar;

    onAwake(): void {
        this._collapBar = this.owner.getComponent(CollapsibleBar);

        this._collapBar.list.repeatX = 1;
        this._collapBar.list.repeatY = this._icons.length;

        let datas: Array<any> = [];
        for (let i = 0; i < this._icons.length; i++) {
            datas[i] = {
                Button: { skin: this._icons[i].url },
                roundRect: { visible: i >= 4 },
                Label: { text: this._iconNames[i] }
            };
        }
        this._collapBar.list.array = datas;

    }
}