/**
 * * 引入 Mock.js, 在项目根目录执行以下命令
 * ```
 * // 带 .d.ts 提示文件
 * npm install --save-dev mockjs @types/mockjs
 * ```
 * 
 * 引入 Axios, 在项目根目录执行以下命令
 * ```
 * npm install axios
 * ```
 * 
 */



const { regClass, property } = Laya;

import axios from "axios";
import Mock from "mockjs";


@regClass()
export class TestMock extends Laya.Script {

    onAwake(): void {
        const data = Mock.mock({
            'list|1-10': [{
                'id|+1': 1
            }]
        });
        console.log("data:", JSON.stringify(data, null, 4));


    }

    onStart(): void {
        console.log("onStart ==========");

        // 延时
        Mock.setup({ timeout: 1000 });

        Mock.mock("data/list", "get", {
            'list|1-10': [{
                'id|+1': 1
            }]
        });

        Mock.mock("data/obj", "get", {
            code:200,
            msg:'ok'
        });

        // 修复：清空或设为正确的 baseURL，避免生成 http://undefined/...
        axios.defaults.baseURL = "";

        axios.get("data/list",).then(res => {
            console.log("data/list res.data:", res.data);
        });

        axios.get("data/obj",).then(res => {
            console.log("data/obj res.data:", res.data);
        });
    }
}