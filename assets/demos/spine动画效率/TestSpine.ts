const { regClass, property } = Laya;

@regClass()
export class TestSpine extends Laya.Script {

    @property({ type: [Laya.Spine2DRenderNode] })
    public spineNodes: Laya.Spine2DRenderNode[];

    public onAwake(): void {

        //const renderElements = this.spineNodes[0]._renderElements;
        //const spriteShaderData = this.spineNodes[0]._spriteShaderData;

        for (let i = 0; i < this.spineNodes.length; i++) {
            //this.spineNodes[i]._renderElements = renderElements;
            //this.spineNodes[i]._spriteShaderData = spriteShaderData;
            console.log(this.spineNodes[i].spineItem);
        }

        console.log(Laya.Spine2DRenderNode._pool);
        //this.spineNodes[0].templet

        Laya.Spine2DRenderNode.createRenderElement2D();
        //Laya.SpineInstanceElement2DTool.create

        console.log(Laya.Spine2DRenderNode._pool);
        Laya.SpineInstanceElement2DTool;
        Laya.SpineInstanceBatch.instance;
        Laya.SpineBakeScript;


        Laya.loader.load("resources/rocketPlayer/player.skel", Laya.Loader.SPINE).then((res: Laya.Templet) => {
            console.log("res", res);
            //const skeleton = res.buildArmature(0);
            //console.log(skeleton);

        });


    }

    onUpdate(): void {
        // console.log(this.spineNodes[0]._materials);
    }
}