{
  "_$ver": 1,
  "_$id": "okuqgtag",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestChangeItem",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "58f9d168-ee7f-4e42-9aaf-ef19df597be4",
      "scriptPath": "demos/列表测试/TestChangeItem.ts",
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
              "x": 40,
              "y": 20,
              "width": 20,
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