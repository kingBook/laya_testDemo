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
        }


      
    }

    onUpdate(): void {
        // console.log(this.spineNodes[0]._materials);
    }
}