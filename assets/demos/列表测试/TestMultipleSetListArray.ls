{
  "_$ver": 1,
  "_$id": "dcpl4a1o",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestMultipleSetListArray",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "e1718246-c76e-48c6-ad53-a33fef94bf12",
      "scriptPath": "demos/列表测试/TestMultipleSetListArray.ts",
      "list": {
        "_$ref": "8lcncda9"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "8lcncda9",
      "_$type": "List",
      "name": "list",
      "x": 225,
      "y": 711,
      "width": 300,
      "height": 100,
      "centerX": 0,
      "bgColor": "#ffffff",
      "itemTemplate": {
        "_$ref": "1rul8mqr",
        "_$tmpl": "itemRender"
      },
      "repeatX": 3,
      "repeatY": 1,
      "scrollType": 1,
      "_$child": [
        {
          "_$id": "1rul8mqr",
          "_$type": "Box",
          "name": "item",
          "width": 100,
          "height": 100,
          "bgColor": "#26394e",
          "_$child": [
            {
              "_$id": "8hb9hx08",
              "_$type": "Label",
              "name": "label",
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