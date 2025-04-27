{
  "_$ver": 1,
  "_$id": "ki70rsdp",
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
      "_$id": "50b20anr",
      "_$type": "Image",
      "name": "bg",
      "x": -237,
      "y": -189,
      "width": 1125,
      "height": 1526,
      "skin": "res://328253e0-e522-4beb-ab2f-864b457dfe14",
      "useSourceSize": true,
      "color": "#ffffff"
    },
    {
      "_$id": "sduyy5mj",
      "_$type": "Sprite",
      "name": "HeroManager",
      "width": 100,
      "height": 100,
      "_$comp": [
        {
          "_$type": "6c4b4fc7-1f96-41a6-bdb7-fbd2cb8f40b5",
          "scriptPath": "../src/kingBook/roles/HeroManager.ts",
          "_heroPrefab": {
            "_$uuid": "1369d904-1d22-4b86-b8aa-3e73fd681e29",
            "_$type": "Prefab"
          }
        }
      ]
    },
    {
      "_$id": "cmqky084",
      "_$type": "Box",
      "name": "PanelGameMap",
      "width": 640,
      "height": 1136,
      "drawCallOptimize": true,
      "left": 0,
      "right": 0,
      "top": 0,
      "bottom": 0,
      "_$comp": [
        {
          "_$type": "18aaf87c-8bb3-4a7d-89c2-89636eaeb1a4",
          "scriptPath": "../src/kingBook/ui/PanelGameMap.ts",
          "_dialogTestListPrefab": {
            "_$uuid": "e189d11c-4b3f-4644-8507-0231eb21e69b",
            "_$type": "Prefab"
          },
          "_panelRolePrefab": {
            "_$uuid": "987afc41-175b-4768-88d9-4e3236f13c48",
            "_$type": "Prefab"
          }
        }
      ],
      "_$child": [
        {
          "_$id": "12bxjwj4",
          "_$type": "Box",
          "name": "CollapsibleBarLeft",
          "width": 82,
          "height": 608,
          "left": 0,
          "top": 0,
          "_$comp": [
            {
              "_$type": "a1f123a3-2b4f-4502-99f6-c2d4594c5e52",
              "scriptPath": "../src/kingBook/ui/CollapsibleBar.ts",
              "_list": {
                "_$ref": "ayeygbbb"
              },
              "_collapseBtn": {
                "_$ref": "z021jhtx"
              }
            },
            {
              "_$type": "d94a4e45-bea2-48fa-a59c-b352ff555a63",
              "scriptPath": "../src/kingBook/ui/CollapsibleBarLeft.ts",
              "_icons": [
                {
                  "_$uuid": "0a9fa50d-b564-4e92-a847-84de452c7184",
                  "_$type": "Texture2D"
                },
                {
                  "_$uuid": "02b63a4e-35da-497c-9dc8-6cdad5cf77c7",
                  "_$type": "Texture2D"
                },
                {
                  "_$uuid": "6bf7d315-c375-47b3-8b3d-512b6daba195",
                  "_$type": "Texture2D"
                },
                {
                  "_$uuid": "ecce2afd-63ed-48d8-813c-b23bf6f3584f",
                  "_$type": "Texture2D"
                },
                {
                  "_$uuid": "0c72f8e4-f9e8-49ba-a61b-56e79022ef74",
                  "_$type": "Texture2D"
                }
              ]
            }
          ],
          "_$child": [
            {
              "_$id": "ivduviby",
              "_$type": "Image",
              "name": "bottomImage",
              "x": 41,
              "width": 80,
              "height": 608,
              "anchorX": 0.5,
              "top": 0,
              "bottom": 0,
              "centerX": 0,
              "skin": "res://cac6cda2-3ddc-4874-828e-dfa09284cc4c",
              "color": "#ffffff"
            },
            {
              "_$id": "ayeygbbb",
              "_$type": "List",
              "name": "List",
              "x": 41,
              "width": 80,
              "height": 538,
              "anchorX": 0.5,
              "mask": {
                "_$ref": "phv3sfk1"
              },
              "top": 0,
              "bottom": 70,
              "centerX": 0,
              "itemTemplate": {
                "_$ref": "6ctp74ho",
                "_$tmpl": "itemRender"
              },
              "repeatX": 1,
              "repeatY": 5,
              "_$child": [
                {
                  "_$id": "phv3sfk1",
                  "_$type": "Box",
                  "name": "mask",
                  "width": 80,
                  "height": 538,
                  "left": 0,
                  "right": 0,
                  "top": 0,
                  "bottom": 0,
                  "bgColor": "#ffffff"
                },
                {
                  "_$id": "6ctp74ho",
                  "_$type": "Box",
                  "name": "Box",
                  "width": 70,
                  "height": 105,
                  "_$comp": [
                    {
                      "_$type": "fede8b92-c62f-4933-8897-662b2bbc54c2",
                      "scriptPath": "../src/kingBook/ui/ListItem.ts"
                    }
                  ],
                  "_$child": [
                    {
                      "_$id": "gc62b7di",
                      "_$type": "Image",
                      "name": "roundRect",
                      "x": 40,
                      "y": 85,
                      "width": 64,
                      "height": 28,
                      "anchorX": 0.5,
                      "anchorY": 0.5,
                      "skin": "res://58a5696a-3f16-43a3-b2a8-65dd84210240",
                      "color": "#222228",
                      "_$child": [
                        {
                          "_$id": "bahkqe5b",
                          "_$type": "Label",
                          "name": "Label_1",
                          "width": 64,
                          "height": 28,
                          "left": 0,
                          "right": 0,
                          "top": 0,
                          "bottom": 0,
                          "text": "20天",
                          "fontSize": 20,
                          "color": "#ffffff",
                          "bold": true,
                          "align": "center",
                          "valign": "middle"
                        }
                      ]
                    },
                    {
                      "_$id": "pw3pnnd4",
                      "_$type": "Button",
                      "name": "Button",
                      "width": 80,
                      "height": 80,
                      "skin": "res://0a9fa50d-b564-4e92-a847-84de452c7184",
                      "label": "",
                      "labelSize": 20,
                      "labelBold": true,
                      "labelColors": "#ffffff,#ffffff,#ffffff",
                      "labelAlign": "center",
                      "labelVAlign": "bottom",
                      "labelStrokeColor": "#32556b"
                    },
                    {
                      "_$id": "qfv4pmqg",
                      "_$type": "Label",
                      "name": "Label",
                      "x": 40,
                      "y": 65,
                      "width": 61,
                      "height": 21,
                      "anchorX": 0.5,
                      "anchorY": 0.5,
                      "_filters": [
                        {
                          "_$type": "GlowFilter",
                          "offX": 0,
                          "offY": 0,
                          "blur": 1.056,
                          "color": "#000"
                        }
                      ],
                      "text": "贸易港",
                      "fontSize": 15,
                      "color": "#ffffff",
                      "bold": true,
                      "align": "center",
                      "valign": "middle"
                    }
                  ]
                }
              ]
            },
            {
              "_$id": "z021jhtx",
              "_$type": "Button",
              "name": "collapseBtn",
              "x": 43,
              "y": 555,
              "width": 58,
              "height": 37,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "_mouseState": 2,
              "hitArea": {
                "_$type": "HitArea",
                "_hitCmds": [
                  {
                    "_$type": "DrawRectCmd",
                    "x": -0.2689655172413794,
                    "y": -0.25405405405405407,
                    "width": 1.413793103448276,
                    "height": 1.5,
                    "fillColor": "#ffffff"
                  }
                ]
              },
              "bottom": 35,
              "centerX": 2,
              "skin": "res://84e4311c-4ea7-436a-bcad-234fad5c364e",
              "label": "",
              "labelSize": 20,
              "labelColors": "#ffffff,#ffffff,#ffffff",
              "labelAlign": "center",
              "labelVAlign": "middle"
            },
            {
              "_$id": "sfigsu55",
              "_$type": "Box",
              "name": "Box",
              "width": 82,
              "height": 704,
              "left": 0
            }
          ]
        },
        {
          "_$id": "xt3brg17",
          "_$type": "Box",
          "name": "CollapsibleBarRight",
          "x": 558,
          "width": 82,
          "height": 176,
          "right": 0,
          "top": 0,
          "_$comp": [
            {
              "_$type": "a1f123a3-2b4f-4502-99f6-c2d4594c5e52",
              "scriptPath": "../src/kingBook/ui/CollapsibleBar.ts",
              "_list": {
                "_$ref": "3sl951ni"
              },
              "_collapseBtn": {
                "_$ref": "fmzb7p5f"
              }
            },
            {
              "_$type": "37b50391-3a92-4d92-babf-a3ef231161d9",
              "scriptPath": "../src/kingBook/ui/CollapsibleBarRight.ts",
              "_icons": [
                {
                  "_$uuid": "02b63a4e-35da-497c-9dc8-6cdad5cf77c7",
                  "_$type": "Texture2D"
                },
                {
                  "_$uuid": "ecce2afd-63ed-48d8-813c-b23bf6f3584f",
                  "_$type": "Texture2D"
                },
                {
                  "_$uuid": "ecce2afd-63ed-48d8-813c-b23bf6f3584f",
                  "_$type": "Texture2D"
                }
              ]
            }
          ],
          "_$child": [
            {
              "_$id": "ulrpeni7",
              "_$type": "Image",
              "name": "bottomImage",
              "x": 41,
              "width": 80,
              "height": 176,
              "anchorX": 0.5,
              "top": 0,
              "bottom": 0,
              "centerX": 0,
              "skin": "res://cac6cda2-3ddc-4874-828e-dfa09284cc4c",
              "color": "#ffffff"
            },
            {
              "_$id": "3sl951ni",
              "_$type": "List",
              "name": "List",
              "x": 41,
              "width": 82,
              "height": 106,
              "anchorX": 0.5,
              "mask": {
                "_$ref": "uzbz2bzf"
              },
              "top": 0,
              "bottom": 70,
              "centerX": 0,
              "itemTemplate": {
                "_$ref": "l3p19pu2",
                "_$tmpl": "itemRender"
              },
              "repeatX": 1,
              "repeatY": 6,
              "_$child": [
                {
                  "_$id": "l3p19pu2",
                  "_$type": "Box",
                  "name": "Box",
                  "width": 70,
                  "height": 105,
                  "_$comp": [
                    {
                      "_$type": "fede8b92-c62f-4933-8897-662b2bbc54c2",
                      "scriptPath": "../src/kingBook/ui/ListItem.ts"
                    }
                  ],
                  "_$child": [
                    {
                      "_$id": "jx00msfx",
                      "_$type": "Image",
                      "name": "roundRect",
                      "x": 40,
                      "y": 85,
                      "width": 64,
                      "height": 28,
                      "anchorX": 0.5,
                      "anchorY": 0.5,
                      "skin": "res://58a5696a-3f16-43a3-b2a8-65dd84210240",
                      "color": "#222228",
                      "_$child": [
                        {
                          "_$id": "x2775onx",
                          "_$type": "Label",
                          "name": "Label_1",
                          "width": 64,
                          "height": 28,
                          "left": 0,
                          "right": 0,
                          "top": 0,
                          "bottom": 0,
                          "text": "20天",
                          "fontSize": 20,
                          "color": "#ffffff",
                          "bold": true,
                          "align": "center",
                          "valign": "middle"
                        }
                      ]
                    },
                    {
                      "_$id": "aueibzzf",
                      "_$type": "Button",
                      "name": "Button",
                      "width": 80,
                      "height": 80,
                      "skin": "res://0a9fa50d-b564-4e92-a847-84de452c7184",
                      "label": "",
                      "labelSize": 20,
                      "labelBold": true,
                      "labelColors": "#ffffff,#ffffff,#ffffff",
                      "labelAlign": "center",
                      "labelVAlign": "bottom",
                      "labelStrokeColor": "#32556b"
                    },
                    {
                      "_$id": "o4bhpclw",
                      "_$type": "Label",
                      "name": "Label",
                      "x": 40,
                      "y": 64,
                      "width": 61,
                      "height": 21,
                      "anchorX": 0.5,
                      "anchorY": 0.5,
                      "_filters": [
                        {
                          "_$type": "GlowFilter",
                          "offX": 0,
                          "offY": 0,
                          "blur": 1.056,
                          "color": "#000"
                        }
                      ],
                      "text": "贸易港",
                      "fontSize": 15,
                      "color": "#ffffff",
                      "bold": true,
                      "align": "center",
                      "valign": "middle"
                    }
                  ]
                },
                {
                  "_$id": "uzbz2bzf",
                  "_$type": "Box",
                  "name": "mask",
                  "width": 82,
                  "height": 106,
                  "left": 0,
                  "right": 0,
                  "top": 0,
                  "bottom": 0,
                  "bgColor": "#ffffff"
                }
              ]
            },
            {
              "_$id": "fmzb7p5f",
              "_$type": "Button",
              "name": "collapseBtn",
              "x": 43,
              "y": 123,
              "width": 58,
              "height": 37,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "_mouseState": 2,
              "hitArea": {
                "_$type": "HitArea",
                "_hitCmds": [
                  {
                    "_$type": "DrawRectCmd",
                    "x": -0.2241379310344828,
                    "y": -0.2972972972972973,
                    "width": 1.3793103448275856,
                    "height": 1.6486486486486478,
                    "fillColor": "#ffffff"
                  }
                ]
              },
              "bottom": 35,
              "centerX": 2,
              "skin": "res://84e4311c-4ea7-436a-bcad-234fad5c364e",
              "label": "",
              "labelSize": 20,
              "labelColors": "#ffffff,#ffffff,#ffffff",
              "labelAlign": "center",
              "labelVAlign": "middle"
            }
          ]
        },
        {
          "_$id": "6ydibulk",
          "_$type": "Box",
          "name": "BottomBar",
          "y": 1056,
          "width": 640,
          "height": 80,
          "left": 0,
          "right": 0,
          "bottom": 0,
          "_$comp": [
            {
              "_$type": "d7f0aa87-f5a7-4470-8c00-46a9e0d34ba1",
              "scriptPath": "../src/kingBook/ui/BottomBar.ts",
              "_icons": [
                {
                  "_$uuid": "0a9fa50d-b564-4e92-a847-84de452c7184",
                  "_$type": "Texture2D"
                },
                {
                  "_$uuid": "02b63a4e-35da-497c-9dc8-6cdad5cf77c7",
                  "_$type": "Texture2D"
                },
                {
                  "_$uuid": "6bf7d315-c375-47b3-8b3d-512b6daba195",
                  "_$type": "Texture2D"
                },
                {
                  "_$uuid": "ecce2afd-63ed-48d8-813c-b23bf6f3584f",
                  "_$type": "Texture2D"
                },
                {
                  "_$uuid": "0c72f8e4-f9e8-49ba-a61b-56e79022ef74",
                  "_$type": "Texture2D"
                }
              ]
            }
          ],
          "_$child": [
            {
              "_$id": "zf9nlhec",
              "_$type": "Image",
              "name": "Image",
              "width": 640,
              "height": 80,
              "left": 0,
              "right": 0,
              "top": 0,
              "bottom": 0,
              "skin": "res://92d5e006-11ce-4df4-813a-3c4080fc5ac9",
              "sizeGrid": "11,10,10,11,0",
              "color": "#ffffff"
            },
            {
              "_$id": "n809lnz4",
              "_$type": "HBox",
              "name": "HBox",
              "x": 321,
              "y": 39,
              "width": 541,
              "height": 66,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "space": 46,
              "align": "middle",
              "_$child": [
                {
                  "_$id": "4m9z7ht4",
                  "_$prefab": "535eae95-587d-45fa-9370-11ccff6826ff",
                  "name": "Box",
                  "active": true,
                  "x": 0,
                  "y": -2,
                  "visible": true,
                  "centerY": 0
                },
                {
                  "_$id": "43aq6s6v",
                  "_$prefab": "535eae95-587d-45fa-9370-11ccff6826ff",
                  "name": "Box_1",
                  "active": true,
                  "x": 116,
                  "y": -2,
                  "visible": true,
                  "centerY": 0
                },
                {
                  "_$id": "73ak4bos",
                  "_$prefab": "535eae95-587d-45fa-9370-11ccff6826ff",
                  "name": "Box_1_1",
                  "active": true,
                  "x": 232,
                  "y": -2,
                  "visible": true,
                  "centerY": 0
                },
                {
                  "_$id": "vzoytvnm",
                  "_$prefab": "535eae95-587d-45fa-9370-11ccff6826ff",
                  "name": "Box_1_1_1",
                  "active": true,
                  "x": 348,
                  "y": -2,
                  "visible": true,
                  "centerY": 0
                },
                {
                  "_$id": "ydxhx9nc",
                  "_$prefab": "535eae95-587d-45fa-9370-11ccff6826ff",
                  "name": "Box_1_1_1_1",
                  "active": true,
                  "x": 464,
                  "y": -2,
                  "visible": true,
                  "centerY": 0
                }
              ]
            }
          ]
        },
        {
          "_$id": "9ippa1gt",
          "_$var": true,
          "_$type": "Button",
          "name": "buttonTestList",
          "x": 239,
          "y": 921,
          "width": 163,
          "height": 40,
          "bottom": 175,
          "centerX": 0,
          "skin": "res://fb303fdb-a5e4-4dd8-9bd9-8935cf323f95",
          "label": "下拉刷新列表",
          "labelSize": 22,
          "labelBold": true,
          "labelColors": "#0e203e,#32cc6b,#ff0000",
          "labelAlign": "center",
          "labelVAlign": "middle"
        },
        {
          "_$id": "3q9nf1nq",
          "_$var": true,
          "_$type": "Button",
          "name": "buttonRole",
          "x": 239,
          "y": 980,
          "width": 163,
          "height": 40,
          "bottom": 116,
          "centerX": 0,
          "skin": "res://fb303fdb-a5e4-4dd8-9bd9-8935cf323f95",
          "label": "角色面板",
          "labelSize": 24,
          "labelBold": true,
          "labelColors": "#123348,#32cc6b,#ff0000",
          "labelAlign": "center",
          "labelVAlign": "middle"
        }
      ]
    }
  ]
}