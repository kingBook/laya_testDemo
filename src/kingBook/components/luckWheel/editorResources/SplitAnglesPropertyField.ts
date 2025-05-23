@IEditor.inspectorField("LuckWheel.SplitAnglesPropertyField")
export class SplitAnglesPropertyField extends IEditor.PropertyField {
    private _input:IEditor.InspectorPanel;


    @IEditor.onLoad
    static async onLoad() {
        //await gui.UIPackage.resourceMgr.load("MyField.widget");
        await IEditor.GUIUtils.createInspectorPanel();
    }

    create() {
        //let input = gui.UIPackage.createWidgetSync("MyField.widget");
        let input= IEditor.GUIUtils.createInspectorPanel();
        this._input=input;
        return { ui: input };
    }

    refresh() {
        //这里负责将数据设置到界面上
        //this._input.inspect();
    }
}