import { MatrixUtil } from "kingBook/utils/MatrixUtil";

const { regClass, property } = Laya;

@regClass()
export class TestEllipseMask extends Laya.Script {

    @property({ type: Laya.Image, private: false })
    private _img: Laya.Image;

    @property({ type: Laya.Sprite, private: false })
    private _mask: Laya.Sprite;

    private _angle = 0;

    onUpdate(): void {
        //this._mask.rotation+=1;
    }

    onKeyDown(evt: Laya.Event): void {
        this._angle = Laya.MathUtil.repeat(this._angle + 1, 360);
        console.log("_angle", this._angle);


        const mat = MatrixUtil.getMatrix(this._img);
        mat.d = Math.cos(this._angle * Math.PI / 180);
        this._img.transform = mat;
    }

}