import { DynamicAtlasManager, TextureInfo } from "./dynamicAtlas/DynamicAtlasManager";
import { LargeTexManager, TextureOut } from "./dynamicAtlas/LargeTexManager";

const { regClass, property } = Laya;

@regClass()
export class TestDynamicAtlas extends Laya.Script {

    @property({ type: Laya.Label })
    public label: Laya.Label;

    @property({ type: Laya.Image })
    public img: Laya.Image;

    @property({ type: Laya.Image })
    public imgRect: Laya.Image;

    @property({ type: Laya.Image })
    public imgRect1: Laya.Image;

    @property({ type: Laya.List })
    public list: Laya.List;

    @property({ type: [Laya.Texture] })
    public texs: Laya.Texture[];

    private _largeTexMgr: LargeTexManager;
    private _dyAtlasMgr: DynamicAtlasManager;
    private _originalTextureId: number;
    private _url="http://oss.nnn777.top/product/steam/image/730/f732bf45b1e3d55db90bd63fb6517b00.png";

    onAwake(): void {
        // this.testLargeTexManager();

        const datas = [];
        for (let i = 0; i < 50; i++) {
            datas.push({ id: i });
        }
        this.list.array = datas;

        const urls = [];
        this.texs.forEach((tex, i) => {
            urls.push(tex.url);
        });

        Laya.loader.load(urls, Laya.Image).then(tex => {
            console.log("load texs complete");
        });

        Laya.loader.load(this._url, Laya.Image).then(tex => {
            console.log("load url complete");
        });

    }

    private testLargeTexManager(): void {
        this._largeTexMgr = new LargeTexManager([2048, 2048], 4);
        this._largeTexMgr.immediately = true;
        console.time("addTexture");
        this.texs.forEach((tex, i) => {
            const code = this._largeTexMgr.addTexture(tex.bitmap as Laya.Texture2D);
            console.log(`i:${i}, code:${code}`);

        });
        console.timeEnd("addTexture");
        //this.img.texture = new Laya.Texture(this._largeTexMgr.getTexture(this.texs[0].id).texture);

        //this.texs.forEach((tex, i) => {
        const tex = this.texs[14];

        const texOut = this._largeTexMgr.getTextureByRef(tex.bitmap as Laya.Texture2D);
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
    }

    onUpdate(): void {
        // this._largeTexMgr && this._largeTexMgr.onUpdate();
    }

    onKeyDown(evt: Laya.Event): void {
        // LargeTexManager
        if (evt.key === 'h') {
            this._largeTexMgr ||= new LargeTexManager([2048, 2048], 4);
            //this._largeTexMgr.immediately = true;
            console.time("addTexture");
            this.texs.forEach((tex, i) => {
                const code = this._largeTexMgr.addTexture(tex.bitmap as Laya.Texture2D);
                console.log(`i:${i}, code:${code}`);

            });
            console.timeEnd("addTexture");
        } else if (evt.key === 'j') {
            this.img.source = new Laya.Texture(this._largeTexMgr.getTexture(this.texs[0].id).texture);
        }

        // DynamicAtlasManager
        if (evt.key === 'u') {
            this._dyAtlasMgr = new DynamicAtlasManager({
                /** 大纹理尺寸 [宽度, 高度] */
                largeTextureSize: [2048, 2048],
                /** 大纹理最大数量 */
                maxLargeTextures: 4,
                /** 小纹理单元尺寸 */
                textureUnitSize: 16,
                /** 纹理扩边尺寸 */
                extendSize: 0,
                /** 纹理格式 */
                textureFormat: Laya.RenderTargetFormat.R8G8B8A8,
                /** 是否立即执行合并 */
                immediately: true,
                /** 是否自动扩展大纹理数量 */
                autoExtend: true,
                /** 是否查重 */
                checkDuplicate: true
            });
            this._dyAtlasMgr["_largeTexManager"].gammaCorrection = 2.2; // 仅用于查看替换效果

            // 测试多张
            console.time("addTexture");
            this.texs.forEach((tex, i) => {
                const result = this._dyAtlasMgr.addTextureByUrl(tex.url);
                console.log(`i:${i}, add result:${result}`);
            });
            console.timeEnd("addTexture");

            // 替换原纹理
            Laya.timer.callLater(this, () => {
                console.time("replaceOriginalTexture");
                this.texs.forEach((tex, i) => {
                    const result = this._dyAtlasMgr.replaceOriginalTexture(tex.bitmap.id);
                    console.log(`i:${i}, replace result:${result}`);
                });
                console.timeEnd("replaceOriginalTexture");
            });
        } else if (evt.key === 'i') {
            this._dyAtlasMgr ||= new DynamicAtlasManager({
                /** 大纹理尺寸 [宽度, 高度] */
                largeTextureSize: [2048, 2048],
                /** 大纹理最大数量 */
                maxLargeTextures: 4,
                /** 小纹理单元尺寸 */
                textureUnitSize: 16,
                /** 纹理扩边尺寸 */
                extendSize: 0,
                /** 纹理格式 */
                textureFormat: Laya.RenderTargetFormat.R8G8B8A8,
                /** 是否立即执行合并 */
                immediately: true,
                /** 是否自动扩展大纹理数量 */
                autoExtend: true,
                /** 是否查重 */
                checkDuplicate: true
            });
            this._dyAtlasMgr["_largeTexManager"].gammaCorrection = 2.2; // 仅用于查看替换效果

            // 测试单独一张
            console.time("addTexture");
            console.log("----------- addTexture");
            const tex = this.texs[17];
            //const tex = Laya.loader.getRes(this._url, Laya.Loader.IMAGE) as Laya.Texture;
            console.log(`tex.id:${tex.id}`);
            console.log(`tex.bitmap.id:${tex.bitmap.id}`);
            console.log(`tex.url:${tex.url}`);
            console.log("tex._dynamic:", tex["_dynamic"]);
            console.log("getTextureInfo:", this._dyAtlasMgr.getTextureInfo(tex.bitmap.id));
            this._originalTextureId = tex.bitmap.id;
            const addSuccess = this._dyAtlasMgr.addTextureByUrl(tex.url);
            console.log(`add Success:${addSuccess}`);
            console.log("tex._dynamic:", tex["_dynamic"]);
            console.log("getTextureInfo:", this._dyAtlasMgr.getTextureInfo(tex.bitmap.id));
            console.log("_textureMap:", this._dyAtlasMgr["_textureMap"]);
            console.timeEnd("addTexture");


            // 替换原纹理
            if (addSuccess) {
                Laya.timer.callLater(this, () => {
                    console.time("replaceOriginalTexture");
                    console.log("----------- replace Original Texture ");
                    console.log(`tex.id:${tex.id}`);
                    console.log(`tex.bitmap.id:${tex.bitmap.id}`);
                    console.log(`tex.url:${tex.url}`);
                    console.log("tex._dynamic:", tex["_dynamic"]);
                    const result2 = this._dyAtlasMgr.replaceOriginalTexture(tex.bitmap.id);
                    console.log(`replace result:${result2}`);
                    console.log(`tex.id:${tex.id}`);
                    console.log(`tex.bitmap.id:${tex.bitmap.id}`);
                    console.log(`tex.url:${tex.url}`);
                    console.log("tex._dynamic:", tex["_dynamic"]);
                    console.log("_textureMap:", this._dyAtlasMgr["_textureMap"]);
                    console.timeEnd("replaceOriginalTexture");
                });
            }
        } else if (evt.key === 'o') {
            console.time("remove Texture");
            console.log("----------- remove Texture");
            console.log("_textureMap:", this._dyAtlasMgr["_textureMap"]);
            const tex = this.texs[17];
            console.log(`tex.id:${tex.id}`);
            console.log(`tex.bitmap.id:${tex.bitmap.id}`);
            console.log(`tex.url:${tex.url}`);
            console.log("tex._dynamic:", tex["_dynamic"]);
            const ret = this._dyAtlasMgr.removeTexture(this._originalTextureId);
            console.log(`remove result:${ret}`);
            console.timeEnd("remove Texture");

            console.time("clear");
            this._dyAtlasMgr.clear();
            console.timeEnd("clear");

        } else if (evt.key === 'p') {
            this.img.source = new Laya.Texture(this._dyAtlasMgr.getLargeTexture(0));
        }
    }


}