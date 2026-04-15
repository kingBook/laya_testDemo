import AnimationCurveUtil from "../AnimationCurveUtil";
import { CurveEditDialog, EVENT_SUBMIT } from "./CurveEditDialog";
import { CurveShape } from "./CurveShape";
import { FloatKey } from "./FloatKey";

/**
 * 
 * @emit {@link EVENT_SUBMIT} 修改后的提交事件, 事件由 {@link this} 派发，回调函数格式: `(): void`
 */
export class CurveInput extends gui.Widget {

    /** 修改后的提交事件, 事件由 {@link this} 派发，回调函数格式: `(): void` */
    public static readonly EVENT_SUBMIT = "eventSubmit";

    /** 曲线图形 */
    private _curveShape: CurveShape;
    /** 曲线编辑窗口 */
    private _curveEditDialog: CurveEditDialog;

    /** 关键帧点数组 */
    public get keys(): FloatKey[] {
        return this._curveShape.keys;
    }

    constructor() {
        super();
        // 宽高
        this.width = 93;
        this.height = 23;

        // 背景
        const bg = new gui.Image();
        bg.name = "bg";
        bg.src = "~/ui/images/input_bg.png";
        bg.width = this.width;
        bg.height = this.width;
        this.addChild(bg);

        // 曲线图形
        this._curveShape = new CurveShape(this, 3, 3, 87, 17, "#666666", "#00ff00");

        // 适配
        this._curveShape.addRelation(this, gui.RelationType.Size);
        bg.addRelation(this, gui.RelationType.Size);

        // 默认关键帧点
        const k0 = new FloatKey();
        k0.time = 0;
        k0.value = 0;
        const k1 = new FloatKey();
        k1.time = 1;
        k1.value = 1;
        this._curveShape.keys = [k0, k1];

        // 点击侦听
        this.on("click", (e: gui.Event) => {
            // 显示曲线编辑窗口
            Editor.showDialog(CurveEditDialog, this, this).then(curveEditDialog => {
                this._curveEditDialog = curveEditDialog;
                // 侦听曲线编辑窗口修改提交
                this._curveEditDialog.contentPane.on(EVENT_SUBMIT, this.onCurveEditDialogSubmit, this);
            });
        });

        // 大小改变侦听
        this.on("size_changed", (e: gui.Event) => {
            this._curveShape.redrawCurve(); // 重画曲线
        });
    }

    /** 曲线编辑窗口修改提交事件回调 */
    private onCurveEditDialogSubmit(e: gui.Event): void {
        this.emit(CurveInput.EVENT_SUBMIT); // 修改提交事件

        this._curveShape.redrawCurve(); // 重画曲线
    }

    /** 清空所有关键帧点 */
    public clearKeys(): void {
        this._curveShape.keys.length = 0;
    }

    /** 添加一个关键帧点 */
    public addKey(): void {
        this._curveShape.keys.push(new FloatKey());
    }

    /** 应用修改 */
    public applyChange(): void {
        this._curveShape.redrawCurve(); // 重画曲线
        this._curveEditDialog?.applyChange();
    }

}