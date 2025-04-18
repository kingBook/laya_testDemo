{
  "_$ver": 1,
  "_$id": "pl6urjl4",
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
      "_$id": "vhi1rs2k",
      "_$type": "List",
      "name": "DownDragRefreshList",
      "x": 210,
      "y": 274,
      "width": 200,
      "height": 300,
      "bgColor": "#9eafd2",
      "itemTemplate": {
        "_$ref": "ezxk955d",
        "_$tmpl": "itemRender"
      },
      "repeatX": 1,
      "repeatY": 6,
      "elasticEnabled": true,
      "scrollType": 2,
      "_$comp": [
        {
          "_$type": "3e0bd175-412f-4531-93f8-dfcb238969e6",
          "scriptPath": "../src/kingBook/ui/DownDragRefreshList.ts",
          "_iconUpDrag": {
            "_$ref": "rhyf8r2o"
          },
          "_iconDownDrag": {
            "_$ref": "r9wvvvuo"
          }
        },
        {
          "_$type": "08bbaed4-027f-4071-8934-dbc403a16249",
          "scriptPath": "../src/kingBook/ui/TestDownDragRefreshList.ts"
        }
      ],
      "_$child": [
        {
          "_$id": "ezxk955d",
          "_$type": "Box",
          "name": "Item",
          "width": 200,
          "height": 50,
          "_$child": [
            {
              "_$id": "8g8nhlqk",
              "_$type": "Image",
              "name": "Image",
              "width": 200,
              "height": 50,
              "left": 0,
              "right": 0,
              "top": 0,
              "bottom": 0,
              "skin": "res://9eb4836d-78c4-4be3-aa53-70a613fef28d",
              "sizeGrid": "7,5,6,7,0",
              "color": "#ffffff"
            },
            {
              "_$id": "ty34jyll",
              "_$type": "Label",
              "name": "Label",
              "width": 200,
              "height": 50,
              "left": 0,
              "right": 0,
              "top": 0,
              "bottom": 0,
              "text": "Label",
              "fontSize": 36,
              "color": "#ffffff",
              "align": "center",
              "valign": "middle"
            }
          ]
        },
        {
          "_$id": "r9wvvvuo",
          "_$type": "Box",
          "name": "IconDownDrag",
          "x": 75,
          "width": 50,
          "height": 50,
          "top": 0,
          "centerX": 0,
          "_$child": [
            {
              "_$id": "8p73c150",
              "_$type": "Image",
              "name": "Arrow",
              "x": 13,
              "y": 13,
              "width": 24,
              "height": 25,
              "centerX": 0,
              "centerY": 0,
              "skin": "res://637c973f-9f5d-4650-805b-9c721f636c95",
              "color": "#ffffff"
            },
            {
              "_$id": "rbcjfdpe",
              "_$type": "Image",
              "name": "Refresh",
              "x": 25,
              "y": 25,
              "width": 24,
              "height": 25,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "visible": false,
              "_mouseState": 2,
              "centerX": 0,
              "centerY": 0,
              "skin": "res://cf2dd71a-80dc-43bc-a04c-756bcb0c936b",
              "useSourceSize": true,
              "color": "#ffffff",
              "_$comp": [
                {
                  "_$type": "Animator2D",
                  "controller": {
                    "_$uuid": "8d5dff06-0aed-408b-a946-8814958e5f2a",
                    "_$type": "AnimationController2D"
                  },
                  "controllerLayers": [
                    {
                      "_$type": "AnimatorControllerLayer2D",
                      "name": "Base Layer",
                      "states": [
                        {
                          "_$type": "AnimatorState2D",
                          "name": "rotate",
                          "clipStart": 0,
                          "clip": {
                            "_$uuid": "365b0155-d46e-45e2-a4a5-bd8fb8b613d1",
                            "_$type": "AnimationClip2D"
                          },
                          "soloTransitions": []
                        }
                      ],
                      "defaultStateName": "rotate"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "_$id": "rhyf8r2o",
          "_$type": "Box",
          "name": "IconUpDrag",
          "x": 75,
          "y": 250,
          "width": 50,
          "height": 50,
          "bottom": 0,
          "centerX": 0,
          "_$child": [
            {
              "_$id": "vpt33w94",
              "_$type": "Image",
              "name": "Arrow",
              "x": 13,
              "y": 38,
              "width": 24,
              "height": 25,
              "scaleY": -1,
              "centerX": 0,
              "centerY": 0,
              "skin": "res://637c973f-9f5d-4650-805b-9c721f636c95",
              "color": "#ffffff"
            },
            {
              "_$id": "men09pga",
              "_$type": "Image",
              "name": "Refresh",
              "x": 25,
              "y": 25,
              "width": 24,
              "height": 25,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "rotation": 360,
              "visible": false,
              "centerX": 0,
              "centerY": 0,
              "skin": "res://cf2dd71a-80dc-43bc-a04c-756bcb0c936b",
              "useSourceSize": true,
              "color": "#ffffff",
              "_$comp": [
                {
                  "_$type": "Animator2D",
                  "controller": {
                    "_$uuid": "8d5dff06-0aed-408b-a946-8814958e5f2a",
                    "_$type": "AnimationController2D"
                  },
                  "controllerLayers": [
                    {
                      "_$type": "AnimatorControllerLayer2D",
                      "name": "Base Layer",
                      "states": [
                        {
                          "_$type": "AnimatorState2D",
                          "name": "rotate",
                          "clipStart": 0,
                          "clip": {
                            "_$uuid": "365b0155-d46e-45e2-a4a5-bd8fb8b613d1",
                            "_$type": "AnimationClip2D"
                          },
                          "soloTransitions": []
                        }
                      ],
                      "defaultStateName": "rotate"
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