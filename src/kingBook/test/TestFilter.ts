const { regClass, property } = Laya;

@regClass()
export class TestFilter extends Laya.Script {

    @property({ type: Laya.Texture })
    public skinTexture: Laya.Texture;

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'h') {
            for (let i = 0; i < 500; i++) {
                const img = new Laya.Image(this.skinTexture.url);
                img.x = Laya.stage.width * Math.random();
                img.y = Laya.stage.height * Math.random();
                img.filters = [new Laya.GlowFilter("#FFFFFF", 3, 0, 0)];
                this.owner.addChild(img);
            }
        } else if (evt.key === 'j') {

            this.owner.children.forEach(child => {
                const childImg = child as Laya.Image;
                const filters = childImg.filters;
                childImg.filters = null;
                filters.forEach(filter => {
                    filter["texture"] && filter["texture"].destroy(); // 所有滤镜都有 texture 属性
                    filter["textureExtend"] && filter["textureExtend"].destroy(); // textureExtend 是 GlowFilter 才有的属性
                });
            });
            this.owner.destroyChildren();
        }
    }
}