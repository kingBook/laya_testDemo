import { MathUtil } from "kingBook/utils/MathUtil";

const { regClass, property } = Laya;

@regClass()
export class TestDrawTriangles extends Laya.Script {

    @property({ type: Laya.Sprite, private: false })
    private _sprite: Laya.Sprite;

    @property({ type: Laya.Texture, private: false })
    private _triangleTexture: Laya.Texture;

    onAwake(): void {

    }


    private _vy: number = 0;

    onKeyDown(evt: Laya.Event): void {
        this._sprite.graphics.clear();


        let index = 0;
        const vertices = new Float32Array(3 * 2);
        vertices[index++] = 0;
        vertices[index++] = 0;

        vertices[index++] = 400;
        vertices[index++] = 0;

        vertices[index++] = 0;
        vertices[index++] = 400;

        index = 0;
        const uvs = new Float32Array(3 * 2);
        uvs[index++] = 0;
        uvs[index++] = 0.5 - this._vy;

        uvs[index++] = 1;
        uvs[index++] = 0.5 - this._vy;

        uvs[index++] = 0;
        uvs[index++] = 1 - this._vy;

        index = 0;
        const indices = new Uint16Array(3);
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = 2;

        this._sprite.graphics.drawTriangles(this._triangleTexture, 0, 0, vertices, uvs, indices);

        this._vy = MathUtil.clamp(this._vy + 0.01, 0, 0.5);

    }
}