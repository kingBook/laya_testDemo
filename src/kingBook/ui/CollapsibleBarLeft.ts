import { CollapsibleBar } from "./CollapsibleBar";

const { regClass, property } = Laya;

/**  游戏地图场景中，左侧的可折叠的条 */
@regClass()
export class CollapsibleBarLeft extends Laya.Script {

    /** 图标名称数组 */
    private _iconNames: Array<string> = ["贸易港", "活动", "首充礼包", "结缘之语", "天外来客"];

    @property({ type: [Laya.Texture2D], private: false, tips: "图标皮肤列表" })
    private _icons: Array<Laya.Texture2D>;

    /** 可折叠的条 */
    private _collapsibleBar: CollapsibleBar;

    onAwake(): void {
        this._collapsibleBar = this.owner.getComponent(CollapsibleBar);
        // 初始化折叠条中的列表
        this.initCollapsibleBarList();
        // 设置显示的图标个数
        this._collapsibleBar.setDisplayItemCount(this._icons.length);
    }

    /** 初始化可折叠条中的列表 */
    private initCollapsibleBarList(): void {
        let datas: Array<any> = [];
        for (let i = 0; i < this._icons.length; i++) {
            datas[i] = {
                Button: { skin: this._icons[i].url },
                roundRect: { visible: i >= 4 },
                Label: { text: this._iconNames[i] }
            };
        }
        this._collapsibleBar.list.array = datas;
    }
}