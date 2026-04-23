/** 预设 */
export default class Presets {

    /** 预设的缓动数据, [0]: 默认值 */
    public static readonly easeDatas = [
        { name: "linear", values: [0, 0, 1, 1] },
        { name: "ease", values: [.25, .1, .25, 1] },
        { name: "ease-in", values: [.42, 0, 1, 1] },
        { name: "ease-out", values: [0, 0, .58, 1] },
        { name: "ease-in-out", values: [.42, 0, .58, 1] }
    ];
}