@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.PropertyField {

    /* @IEditor.onLoad
     static async onLoad() {
         await gui.UIPackage.resourceMgr.load("MyField.widget");
     }*/

    public override create(): IEditor.IPropertyFieldCreateResult {
        const input: IEditor.CurveInput = IEditor.GUIUtils.createCurveInput();
        input.setDefaultPoints();
        input.isCurve = true;
        input.maxKeyFrame = 2;
        //input.isNormalization = true;
        //input.minValue = 0;
        //input.maxValue = 1;
        //input.isWeight = true;
        console.log("curveInput:", input);
        console.log("points:", input.points);
        console.log(input);
        return { ui: input };
    }

    refresh() {
        //这里负责将数据设置到界面上
    }

    
}