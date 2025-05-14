@IEditor.inspectorField("MyTestField")
export class TestField extends IEditor.PropertyField {
    @IEditor.onLoad
    static async onLoad() {
        await IEditor.GUIUtils.createNumericInput();
    }

    create() {
        let input: IEditor.NumericInput = IEditor.GUIUtils.createNumericInput();
        input.on("changed", () => {
            console.log("改变了！");
        })
        this._input = input;
        return { ui: input };
    }

    private _input: IEditor.NumericInput

    refresh() {
        //这里负责将数据设置到界面上
        console.log("inspector idx:",this._input.getChild("title").text);

        this.target.setValue(parseFloat(this._input.getChild("title").text))
    }
}