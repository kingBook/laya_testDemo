import { LargeTexManager } from "./dynamicAtlasManager/LargeTexManager";

const { regClass, property } = Laya;

@regClass()
export class TestDynamicAtlas extends Laya.Script {

    @property({ type: [Laya.Texture2D] })
    public texs: Laya.Texture2D[];

    @property({ type: Laya.Image })
    public img: Laya.Image;

    private _largeTexMgr: LargeTexManager;

    /*onAwake(): void {
        this._largeTexMgr = new LargeTexManager([2048, 2048], 4);
        this._largeTexMgr.immediately = true;
        console.time("addTexture");
        this.texs.forEach((tex, i) => {
            const code = this._largeTexMgr.addTexture(tex);
            console.log(`i:${i}, code:${code}`);

        });
        console.timeEnd("addTexture");
        //this.img.texture = new Laya.Texture(this._largeTexMgr.getTexture(this.texs[0].id).texture);

        //this.texs.forEach((tex, i) => {
        const tex = this.texs[14];

        const texOut = this._largeTexMgr.getTextureByRef(tex);
        console.log(`图集宽高：`, texOut.texture.width, texOut.texture.height);
        console.log(`图元:`, "x:", texOut.texItem.x, "y:", texOut.texItem.y, "w:", texOut.texItem.w, "h:", texOut.texItem.h);
        const nx = texOut.texItem.x;
        const ny = texOut.texItem.y;
        const nwidth = texOut.texItem.w;
        const nheight = texOut.texItem.h;
        const nuv = Float32Array.from([
            nx, ny,
            nx + nwidth, ny,
            nx + nwidth, ny + nheight,
            nx, ny + nheight
        ]);
        //});

        const itemTex = new Laya.Texture();
        itemTex.setTo(texOut.texture, nuv);
        // this.img.texture = itemTex;
        this.img.source = itemTex;




    }*/

    onUpdate(): void {
        this._largeTexMgr && this._largeTexMgr.onUpdate();
        
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'h') {
            this._largeTexMgr ||= new LargeTexManager([2048, 2048], 4);
            //this._largeTexMgr.immediately = true;
            console.time("addTexture");
            this.texs.forEach((tex, i) => {
                const code = this._largeTexMgr.addTexture(tex);
                console.log(`i:${i}, code:${code}`);

            });
            console.timeEnd("addTexture");
        } else if (evt.key === 'j') {
            this.img.texture = new Laya.Texture(this._largeTexMgr.getTexture(this.texs[0].id).texture);
        }
    }
}