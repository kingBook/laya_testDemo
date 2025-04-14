import { Fsm } from "../fsm/Fsm";
import { State } from "../fsm/State";

const { regClass, property } = Laya;

@regClass()
export class UIStateGameing extends State {

    public onStateEnter(fsm: Fsm): void {
        console.log("UIStateGameing");

        
    }

}