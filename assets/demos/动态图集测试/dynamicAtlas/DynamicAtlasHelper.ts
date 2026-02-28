import { DynamicAtlasManager } from "./DynamicAtlasManager";

export class DynamicAtlasHelper {

    public isShowLog: boolean = true;

    private dynamicAtlasMgr: DynamicAtlasManager;
    private addedUrls: string[] = [];
    private replacedOriginIds: number[] = [];

    public static create(): DynamicAtlasHelper {
        const inst = new DynamicAtlasHelper();

        inst.dynamicAtlasMgr = new DynamicAtlasManager({
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
        }/*, false*/);
        // inst.dynamicAtlasMgr["_largeTexManager"].gammaCorrection = 2.2; // 仅用于查看替换效果
        return inst;
    }

    /** 添加纹理到图集，并替换原始纹理对象，使其使用图集中的纹理 */
    public addAndReplaceTextureByUrl(url: string, scale: number = 1): void {
        if (this.addedUrls.indexOf(url) > -1) return;
        this.addedUrls.push(url);

        const completeFn = () => {
            this.isShowLog && console.time("addAndReplaceTextureByUrl");
            const tex = Laya.loader.getRes(url, Laya.Loader.IMAGE) as Laya.Texture;
            this.dynamicAtlasMgr.addTexture(tex, scale);
            this.replacedOriginIds.push(tex.bitmap.id);
            this.dynamicAtlasMgr.replaceOriginalTexture(tex.bitmap.id);
            this.isShowLog && console.timeEnd("addAndReplaceTextureByUrl");
            this.isShowLog && console.log("addAndReplaceTextureByUrl", "getTextureCount:", this.dynamicAtlasMgr.getTextureCount(), "getAllLargeTextures:", this.dynamicAtlasMgr.getAllLargeTextures().length);
        };

        if (Laya.loader.getRes(url)) {
            completeFn.call(this);
        } else {
            Laya.loader.load(url).then(completeFn.bind(this));
        }
    }

    /** 从图集中移除纹理，并清空图集 */
    public removeAndClear(): void {
        this.isShowLog && console.time("removeAndClear");
        this.addedUrls.length = 0;

        // 从图集中移除纹理
        this.replacedOriginIds.forEach(originTexId => {
            this.dynamicAtlasMgr.removeTexture(originTexId);
        });
        this.replacedOriginIds.length = 0;

        // 清空图集
        this.dynamicAtlasMgr.clear();
        this.isShowLog && console.timeEnd("removeAndClear");
    }
}