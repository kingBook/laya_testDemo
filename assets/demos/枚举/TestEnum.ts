const { regClass, property } = Laya;

/** 清除选项枚举（使用二进制位表示多个选项） */
enum ClearOptions {
    /** 用户中奖项高光 */
    UserWinLighting = 1,
    /** 开奖项高光 */
    WinLighting = 2,
    /** 投入物资的总人数 */
    PeopleNum = 4,
    /** 所有人投入的金额 */
    MoneyAllPeople = 8,
    /** 自己投入的总金额 */
    TotalMoneySelf = 16,
    /** 选中项 */
    Selections = 32,
    /** 准备投入该项的金额 */
    PreparedMoney = 64,
    /** 用户中奖赢得的金额 */
    UserWinMoney = 128,
    /** 所有 */
    All = -1
}

@regClass()
export class TestEnum extends Laya.Script {



    onAwake(): void {
        let clearOptions:ClearOptions = ClearOptions.UserWinLighting | ClearOptions.WinLighting;
        console.log(clearOptions);

    }
}