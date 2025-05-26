@IEditor.inspectorField("MyTestField")
export class TestField extends IEditor.ArrayField {
    // @IEditor.onLoad
    // static async onLoad() {
    //     //await IEditor.GUIUtils.createNumericInput();
    //     await gui.UIPackage.resourceMgr.load("~/ui/basic/Inspector/ArrayField.widget");
    // }

    public override create(): IEditor.IPropertyFieldCreateResult {
        //    let input: IEditor.NumericInput = IEditor.GUIUtils.createNumericInput();
        //     input.on("changed", () => {
        //         console.log("改变了！");
        //     })
        //     this._input = input;

        //let input = gui.UIPackage.createWidgetSync("editorResources/MyField.widget");

        let input = gui.UIPackage.createWidgetSync("~/ui/basic/Inspector/ArrayField.widget");


        let btn = IEditor.GUIUtils.createButton();


        console.log("input:", input);

        let superResult = super.create();

        console.log("ui:", superResult.ui);

        let buttons = superResult.ui.getChild("buttons");
        buttons.addChild(btn);
        let lastChild = buttons.getChildAt(buttons.numChildren - 1);
        btn.x = lastChild.x + lastChild.width;
        /*btn.x = btn.parent.width - btn.width;
        let relation = new gui.Relation();
        relation.owner = btn;
        relation.target = btn.parent;
        relation.add(gui.RelationType.Right_Right, false);
        btn.relations.push(relation);*/


        console.log("create");

        btn.on("click", (event: gui.Event) => {
            console.log("on click", event);
            // 场景新建节点
            Editor.scene.createNode("Sprite").then((node: IEditor.IMyNode) => {
                let current:IEditor.IMyNode = Editor.scene.getSelection()[0];


                                
                node.props._gcmds=current.props._gcmds;

                console.log("node:",node.props._gcmds);
                console.log("current:",current.props._gcmds);

                
                current.addChild(node);
               
                
            });
            
        }, this);


        /*const scene = Laya.stage;
        const newNode = new Laya.Sprite();
        newNode.name = "CustomNode";
        scene.addChild(newNode);*/
        //Editor.sce.sendToPanel("Hierarchy", "refresh");







        //superResult.ui = input;
        return superResult;
    }

    // private _input: IEditor.NumericInput

    refresh() {
        //这里负责将数据设置到界面上
        //console.log("inspector idx:",this._input.getChild("title").text);

        // this.target.setValue(parseFloat(this._input.getChild("title").text))

    }
}