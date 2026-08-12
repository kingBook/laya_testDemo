
/** 双色渐变属性检视器 */
@IEditor.inspectorField("TwoColorGradient")
export default class TwoColorGradientInspector extends IEditor.PropertyField {


    public override create(): IEditor.IPropertyFieldCreateResult {
        const input = IEditor.GUIUtils.createGradientInput();
        //input.lockMode=1;
        return { ui: input };
    }

    /** 当数据发生改变时，会调用这个方法 */
    public override refresh(): void {

    }
}