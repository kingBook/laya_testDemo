{
  "_$ver": 1,
  "_$id": "lx8mwule",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "Scene2D",
  "width": 640,
  "height": 1136,
  "_$child": [
    {
      "_$id": "3jeyjwg2",
      "_$type": "Sprite",
      "name": "UIManager",
      "width": 640,
      "height": 1136,
      "visible": false,
      "_$comp": [
        {
          "_$type": "986364e7-b432-4858-9716-9495a00da1f2",
          "scriptPath": "../src/kingBook/ui/UIManager.ts",
          "_panelStartPrefab": {
            "_$uuid": "382b9e22-207d-4130-bbe4-1fc940700e0f",
            "_$type": "Prefab"
          },
          "_loadingPage": {
            "_$ref": "fb3yu7sl"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "fb3yu7sl",
          "_$type": "Box",
          "name": "loadingPage",
          "width": 640,
          "height": 1136,
          "visible": false,
          "left": 0,
          "right": 0,
          "top": 0,
          "bottom": 0,
          "bgColor": "#414f62",
          "_$comp": [
            {
              "_$type": "19186a80-27ec-48b1-ab46-32ec282c7dec",
              "scriptPath": "../src/kingBook/ui/SceneLonadingPage.ts",
              "_progressBar": {
                "_$ref": "zp2ol7lr"
              },
              "_progressLabel": {
                "_$ref": "56czqra3"
              }
            }
          ],
          "_$child": [
            {
              "_$id": "zp2ol7lr",
              "_$type": "ProgressBar",
              "name": "ProgressBar",
              "x": 161,
              "y": 553,
              "width": 319,
              "height": 30,
              "centerX": 0,
              "centerY": 0,
              "skin": "res://fb1937cc-6a31-4274-a924-dc58e28d3abd",
              "value": 0,
              "_$child": [
                {
                  "_$id": "56czqra3",
                  "_$type": "Label",
                  "name": "Label",
                  "x": 100,
                  "y": 1,
                  "width": 120,
                  "height": 28,
                  "centerX": 0,
                  "centerY": 0,
                  "text": "100%",
                  "fontSize": 20,
                  "color": "#ffffff",
                  "bold": true,
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