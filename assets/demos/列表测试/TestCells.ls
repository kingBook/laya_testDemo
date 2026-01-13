{
  "_$ver": 1,
  "_$id": "okuqgtag",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestCells",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "84e7fb85-acad-4d42-9371-ef446b38e87f",
      "scriptPath": "demos/列表测试/TestCells.ts",
      "list": {
        "_$ref": "w8m1ot0k"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "w8m1ot0k",
      "_$type": "List",
      "name": "list",
      "x": 225,
      "y": 229,
      "width": 300,
      "height": 100,
      "centerX": 0,
      "bgColor": "#ffffff",
      "itemTemplate": {
        "_$ref": "tjelq773",
        "_$tmpl": "itemRender"
      },
      "repeatX": 3,
      "repeatY": 1,
      "scrollType": 1,
      "_$child": [
        {
          "_$id": "tjelq773",
          "_$type": "Box",
          "name": "item",
          "width": 100,
          "height": 100,
          "bgColor": "#26394e",
          "_$child": [
            {
              "_$id": "vqmp3b5z",
              "_$type": "Label",
              "name": "label",
              "x": 35,
              "y": 20,
              "width": 30,
              "height": 61,
              "centerX": 0,
              "centerY": 0,
              "text": "-",
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