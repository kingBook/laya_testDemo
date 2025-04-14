import { Fsm } from "../fsm/Fsm";
import { UIStateStart } from "./UIStateStart";

const { regClass, property } = Laya;

/** 管理 UI 的有限状态机 */
@regClass()
export class UIManagerFsm extends Fsm {
    
    onAwake(): void {
        this.addState(UIStateStart);
        this.init();
        this.changeStateTo(UIStateStart);
    }

}