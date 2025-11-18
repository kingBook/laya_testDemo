@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.PropertyField {

    /* @IEditor.onLoad
     static async onLoad() {
         await gui.UIPackage.resourceMgr.load("MyField.widget");
     }*/

    public override create(): IEditor.IPropertyFieldCreateResult {
        const input:IEditor.CurveInput = IEditor.GUIUtils.createCurveInput();
        input.setDefaultPoints();
        input.isCurve = true;
        console.log("curveInput:", input);
        console.log("points:", input.points);
        return { ui: input };
    }

    refresh() {
        //这里负责将数据设置到界面上
    }
}