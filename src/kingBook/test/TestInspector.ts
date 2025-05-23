import Pie from "./Pie";


const { regClass, property } = Laya;

@regClass()
export class TestInspector extends Laya.Script {
    
    //隐藏控制
    @property({ type: Boolean })
    a: boolean;
    @property({ type: String, hidden: "!data.a" })//将条件表达式!data.a放在了字符串中，如果a为true（在IDE中为勾选状态），则!data.a返回false，此时hidden属性表示的是显示
    hide: string = "";

    // 只读控制
    @property({ type: Boolean })
    b: boolean;
    @property({ type: String, readonly: "data.b" })//将条件表达式data.b放在了字符串中，如果b为true（在IDE中为勾选状态），则data.b就返回true，此时readonly属性表示只读
    read: string = "";

    //数据检查机制
    @property(String)
    text1: string;
    @property({ type: String, validator: "if (value == data.text1) return '不能与a值相同' " })
    text2: string = "";

    //密码输入
    @property({ type: String, password: true })
    password: string;

    //如果true或者缺省，文本输入每次输入都提交；否则只有在失焦时才提交
    @property({ type: String, submitOnTyping: false })
    submit: string;

    //输入文本的提示信息
    @property({ type: "text", prompt: "文本提示信息" })
    prompt: string;

    //显示为下拉框
    @property({ type: Number, enumSource: [{ name: "Yes", value: 1 }, { name: "No", value: 0 }] })
    enumsource: number;

    //反转布尔值
    @property({ type: "boolean", reverseBool: true })
    reverseboolean: boolean;

    //允许null值
    @property({ type: String, nullable: true })
    nullable: string;

    //控制数字输入的精度和范围
    @property({ type: Number, range: [0, 5], step: 0.5, fractionDigits: 3 })
    range: number;

    //显示为百分比
    @property({ type: Number, range: [0, 1], percentage: true })
    percent: number;

    //固定数组长度
    @property({ type: ["number"], fixedLength: true })
    arr1: number[];

    //数组允许的操作
    @property({ type: ["number"], arrayActions: ["delete", "move"] })
    arr2: number[];

    //使数组元素编辑时限制最大值和最小值
    @property({ type: [Number], elementProps: { range: [0, 100] } })
    array1: Array<Number>;
    //如果是多维数组，则elementProps同样需要使用多层
    @property({ type: [[Number]], elementProps: { elementProps: { range: [0, 10] } } })
    array2: Array<Array<Number>>;

    //不提供透明度a值的修改
    @property({ type: Laya.Color, showAlpha: false })
    color1: Laya.Color;

    //颜色类型时，defaultColor定义一个非null时的默认值
    @property({ type: String, inspector: "color", defaultColor: "rgba(217, 232, 0, 1)" })
    color2: string;

    //显示一个checkbox决定颜色是否为null
    @property({ type: Laya.Color, colorNullable: true })
    color3: Laya.Color;

    //加载Image资源类型，设置资源路径格式
    @property({ type: String, isAsset: true, assetTypeFilter: "Image" })
    resource: string;

    //x属性出现在testposition属性之前
    @property({ type: String })
    x: string;
    //可以用position人为将testposition属性安排在x属性之前显示
    @property({ type: String, position: "before x" })
    testposition: string;

    //增加缩进，单位是层级
    @property({ type: String, addIndent: 1 })
    indent1: string;
    @property({ type: String, addIndent: 2 })
    indent2: string;

    //当属性改变时，调用名称为onChangeTest的函数
    @property({ type: Boolean, onChange: "onChangeTest" })
    change: boolean;
    onChangeTest() {
        console.log("onChangeTest");
    }

    @property([["string"]])
    test1: string[][] = [["a", "b", "c"], ["e", "f", "g"]];

    @property([["Record", "string"]])
    test2: Array<Record<string, string>> = [{ name: "A", value: "a" }, { name: "B", value: "b" }];

    @property({ type: ["Record", [Number]], elementProps: { elementProps: { range: [0, 10] } } })
    test3: Record<string, number[]> = { "a": [1, 2, 3], "b": [4, 5, 6] };

    @property(["Record", [Laya.Prefab]])
    test4: Record<string, Laya.Prefab[]>;


    //这个属性提供一个get方法，返回下拉选项，这个数据一般只用于编辑器，所以设置不保存
    @property({ type: [["Record", String]], serializable: false })
    get itemsProvider(): Array<Record<string, string>> {
        return [{ name: "Item0", value: "0" }, { name: "Item1", value: "1" }];
    }
    //将enumSource设置为一个字符串，表示使用该名字的属性作为下拉数据源
    @property({ type: String, enumSource: "itemsProvider" })
    enumItems: string;

    @property({ type: Laya.Vector3 })
    v3: Laya.Vector3;

    @property({ type: Pie })
    pie: Pie;

    @property({ type: [Number], inspector: "MyTestField", writable:false })
    public indices: number[]=[1,2];
    
    onAwake(): void {
        console.log("indices.length",this.indices.length);
        
    }
}


