{
  "_$ver": 1,
  "_$id": "v5znvgui",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestScrollingLotteryMultipleListScript",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "7a9b5dd7-7dcc-439b-b894-caea9f0de77b",
      "scriptPath": "demos/循环滚动抽奖列表/TestScrollingLotteryMultipleListScript.ts",
      "_multipleLottry": {
        "_$ref": "qo7n3zpv",
        "_$type": "168a8568-ba24-4994-a2d0-56f7d7c5dc95"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "pcoqu27z",
      "_$type": "Panel",
      "name": "Panel",
      "x": 225,
      "y": 650,
      "width": 300,
      "height": 300,
      "visible": false,
      "centerX": 0,
      "centerY": 0,
      "bgColor": "#8a6e6e",
      "scrollType": 2,
      "_$child": [
        {
          "_$id": "qo7n3zpv",
          "_$prefab": "9cdb7a64-1b89-4d95-a7e4-2afe0e43f40a",
          "name": "ScrollingLotteryMultipleList",
          "active": true,
          "x": 0,
          "y": 100,
          "height": 900,
          "anchorY": 0,
          "visible": true,
          "repeatY": 8
        }
      ]
    },
    {
      "_$id": "22haxuvw",
      "_$type": "Box",
      "name": "lineH",
      "x": 375,
      "y": 598,
      "width": 1,
      "height": 500,
      "centerX": 0,
      "bgColor": "#00ff34"
    }
  ]
}