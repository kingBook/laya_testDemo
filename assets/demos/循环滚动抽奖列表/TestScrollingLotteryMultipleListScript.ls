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
      "scriptPath": "demos/循环滚动抽奖列表/TestScrollingLotteryMultipleListScript.ts"
    }
  ],
  "_$child": [
    {
      "_$id": "k4qsyepr",
      "_$type": "List",
      "name": "ScrollingLotteryMultipleList",
      "x": 225,
      "y": 650,
      "width": 300,
      "height": 300,
      "itemTemplate": {
        "_$ref": "gfwyecvh",
        "_$tmpl": "itemRender"
      },
      "repeatX": 1,
      "repeatY": 1,
      "scrollType": 2,
      "_$comp": [
        {
          "_$type": "168a8568-ba24-4994-a2d0-56f7d7c5dc95",
          "scriptPath": "demos/循环滚动抽奖列表/ScrollingLotteryMultipleListScript.ts",
          "_subListTemplate": {
            "_$ref": "1523uk2c"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "gfwyecvh",
          "_$type": "Box",
          "name": "item",
          "width": 300,
          "height": 100,
          "_$child": [
            {
              "_$id": "1523uk2c",
              "_$type": "List",
              "name": "ScrollingLotteryList",
              "width": 300,
              "height": 100,
              "bgColor": "#ffffff",
              "itemTemplate": {
                "_$ref": "3kn6w7vz",
                "_$tmpl": "itemRender"
              },
              "repeatX": 3,
              "repeatY": 1,
              "scrollType": 1,
              "_$comp": [
                {
                  "_$type": "250a8313-8524-4316-aea2-24f623598970",
                  "scriptPath": "demos/循环滚动抽奖列表/ScrollingLotteryListScript.ts",
                  "focusT": 0.5,
                  "speedSign": 1,
                  "aniTotalTime": 5000,
                  "circles": 5
                }
              ],
              "_$child": [
                {
                  "_$id": "3kn6w7vz",
                  "_$type": "Box",
                  "name": "item",
                  "width": 100,
                  "height": 100,
                  "bgColor": "#26394e",
                  "_$child": [
                    {
                      "_$id": "0chjw3r6",
                      "_$type": "Label",
                      "name": "idxLabel",
                      "x": 35,
                      "y": 20,
                      "width": 30,
                      "height": 61,
                      "centerX": 0,
                      "centerY": 0,
                      "text": "0",
                      "fontSize": 60,
                      "color": "#ffffff",
                      "fitContent": "yes",
                      "align": "center",
                      "valign": "middle"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}