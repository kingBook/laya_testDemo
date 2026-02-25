import { DynamicAtlasManager, TextureInfo } from "./dynamicAtlas/DynamicAtlasManager";
import { LargeTexManager, TextureOut } from "./dynamicAtlas/LargeTexManager";

const { regClass, property } = Laya;

@regClass()
export class TestDynamicAtlas extends Laya.Script {

    @property({ type: [Laya.Texture] })
    public texs: Laya.Texture[];

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

    private _largeTexMgr: LargeTexManager;
    private _dyAtlasMgr: DynamicAtlasManager;

    onAwake(): void {
        /*this._largeTexMgr = new LargeTexManager([2048, 2048], 4);
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
        this.img.source = itemTex;*/

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
            this.img.texture = new Laya.Texture(this._largeTexMgr.getTexture(this.texs[0].id).texture);
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
            
            // 测试单独一张
            console.time("addTexture");
            const tex = this.texs[17];

            const result = this._dyAtlasMgr.addTextureByUrl(tex.url);
            console.log(`add result:${result}`);
            console.timeEnd("addTexture");

            // 替换原纹理
            Laya.timer.callLater(this, () => {
                console.time("replaceOriginalTexture");
                console.log(`替换前 tex.bitmap.id:${tex.bitmap.id}`);
                const result2 = this._dyAtlasMgr.replaceOriginalTexture(tex.bitmap.id);
                console.log(`replace result:${result2}`, `替换后 tex.bitmap.id:${tex.bitmap.id}`);
                console.timeEnd("replaceOriginalTexture");
            });
        } else if (evt.key === 'o') {
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

            // 测试单独一张
            console.time("addTexture");
            const tex = this.texs[17];
            const result = this._dyAtlasMgr.addTextureByUrl(tex.url);
            console.log(`add result:${result}`);
            console.timeEnd("addTexture");

            // 仅替换当前使用的纹理
            const textureId = tex.bitmap.id;
            const textureInfo = this._dyAtlasMgr.getTextureInfo(textureId);
            const textureOut = this._dyAtlasMgr["_largeTexManager"].getTexture(textureId, textureInfo.largeTextureIndex);
            console.log("textureInfo:", textureInfo);
            console.log("textureOut:", textureOut);
            this.replaceTexture(textureInfo, textureOut);
        } else if (evt.key === 'p') {
            this.img.texture = new Laya.Texture(this._dyAtlasMgr.getLargeTexture(0));
        }
    }

    private replaceTexture(textureInfo: TextureInfo, textureOut: TextureOut): boolean {
        // 标记为已合并，避免重复处理
        textureInfo.merged = true;

        let textureMap = textureInfo.textureMap;
        let rt = textureOut.texture;
        /** 保存原始uv */
        // textureInfo.originalUV = originalTexture.uv;
        /** 保存原始texture2d */
        // textureInfo.originalTexture2d = originalTexture.bitmap as Texture2D;

        let x = textureOut.texItem.x;
        let y = textureOut.texItem.y;
        let w = textureOut.texItem.w;
        let h = textureOut.texItem.h;

        textureMap.forEach(({ texture, uv }, id) => {
            if (texture.bitmap !== rt) {
                let oSWidth = texture.sourceWidth;
                let oSHeight = texture.sourceHeight;
                let oWidth = texture.width;
                let oHeight = texture.height;

                let nuv: Float32Array;
                if (uv === Laya.Texture.DEF_UV) {
                    // 默认UV，使用调整后的图集位置
                    nuv = Float32Array.from([
                        x, y,
                        x + w, y,
                        x + w, y + h,
                        x, y + h
                    ]);
                } else {
                    // 已有UV，需要重新计算在大图合集中的位置
                    // 原始UV坐标（相对于原纹理的归一化坐标）
                    let ox = uv[0];
                    let oy = uv[1];
                    let owidth = uv[2] - ox;
                    let oheight = uv[5] - oy;

                    // 计算在大图合集中的新UV坐标
                    // 将原始UV坐标映射到大图合集的对应区域
                    let nx = x + ox * w;  // 调整后的起始位置 + 原始UV偏移 * 调整后的宽度
                    let ny = y + oy * h;  // 调整后的起始位置 + 原始UV偏移 * 调整后的高度
                    let nwidth = owidth * w;      // 原始UV宽度 * 调整后的宽度
                    let nheight = oheight * h;    // 原始UV高度 * 调整后的高度

                    nuv = Float32Array.from([
                        nx, ny,
                        nx + nwidth, ny,
                        nx + nwidth, ny + nheight,
                        nx, ny + nheight
                    ]);
                }

                // texture.setTo(rt, nuv, oSWidth, oSHeight);
                // texture.event(Laya.Event.CHANGE);
                // texture.width = oWidth;
                // texture.height = oHeight;
                // (<any>texture)._dynamic = textureInfo;

                this.imgRect.source.setTo(rt, nuv, oSWidth, oSHeight);
                this.imgRect.source.width = oWidth;
                this.imgRect.source.height = oHeight;

                this.imgRect1.source.setTo(rt, nuv, oSWidth, oSHeight);
                this.imgRect1.source.width = oWidth;
                this.imgRect1.source.height = oHeight;
            }
        });

        return true;
    }

}