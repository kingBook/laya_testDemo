{
  "_$ver": 1,
  "_$id": "i9qnbypy",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestSpine",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "dada79fe-e580-498a-b139-4613ee54e8b1",
      "scriptPath": "demos/spine动画效率/TestSpine.ts",
      "spineNodes": [
        {
          "_$ref": "bw00r7tp",
          "_$type": "Spine2DRenderNode"
        },
        {
          "_$ref": "809c56eh",
          "_$type": "Spine2DRenderNode"
        },
        {
          "_$ref": "givr55l2",
          "_$type": "Spine2DRenderNode"
        }
      ]
    }
  ],
  "_$child": [
    {
      "_$id": "bw00r7tp",
      "_$type": "Sprite",
      "name": "hero-pro",
      "x": 204,
      "y": 975,
      "width": 319,
      "height": 334,
      "anchorX": 0.727,
      "anchorY": 1,
      "_$comp": [
        {
          "_$type": "Spine2DRenderNode",
          "layer": 1,
          "useFastRender": false,
          "source": "res://866c1471-644a-435e-a1df-b16f5cf481c2",
          "animationName": "attack",
          "preview": true,
          "physicsUpdate": 2
        }
      ]
    },
    {
      "_$id": "809c56eh",
      "_$type": "Sprite",
      "name": "hero-pro_1",
      "x": 567,
      "y": 1379,
      "width": 319,
      "height": 334,
      "anchorX": 0.727,
      "anchorY": 1,
      "_$comp": [
        {
          "_$type": "Spine2DRenderNode",
          "layer": 1,
          "useFastRender": false,
          "source": "res://866c1471-644a-435e-a1df-b16f5cf481c2",
          "animationName": "attack",
          "preview": true,
          "physicsUpdate": 2
        }
      ]
    },
    {
      "_$id": "givr55l2",
      "_$type": "Sprite",
      "name": "hero-pro_2",
      "x": 339,
      "y": 1383,
      "width": 319,
      "height": 334,
      "anchorX": 0.727,
      "anchorY": 1,
      "_$comp": [
        {
          "_$type": "Spine2DRenderNode",
          "layer": 1,
          "useFastRender": false,
          "source": "res://866c1471-644a-435e-a1df-b16f5cf481c2",
          "animationName": "attack",
          "preview": true,
          "physicsUpdate": 2
        }
      ]
    },
    {
      "_$id": "13xxebr5",
      "_$type": "Image",
      "name": "Image",
      "x": 211,
      "y": 729,
      "width": 512,
      "height": 313,
      "cacheAs": "bitmap",
      "skin": "res://c13c1b8e-c516-4a0f-98ad-e356f45f0365",
      "useSourceSize": true,
      "color": "#ffffff"
    },
    {
      "_$id": "qvty2tfp",
      "_$type": "Button",
      "name": "Button",
      "x": 333,
      "y": 798,
      "width": 120,
      "height": 40,
      "skin": "res://d4cfd6a8-0d0a-475b-ac93-d85eaa646936",
      "label": "Title",
      "labelSize": 20,
      "labelAlign": "center",
      "labelVAlign": "middle",
      "_$child": [
        {
          "_$id": "ruaplwf6",
          "_$type": "Label",
          "name": "txt",
          "x": -10,
          "y": -1,
          "width": 140,
          "height": 43,
          "cacheAs": "bitmap",
          "centerX": 0,
          "centerY": 0,
          "text": "[img]resources/icon_zuanShi.png[/img]{p=0} 开启",
          "fontSize": 32,
          "color": "#473a2f",
          "fitContent": "yes",
          "ubb": true,
          "html": true,
          "templateVars": true
        }
      ]
    }
  ]
}