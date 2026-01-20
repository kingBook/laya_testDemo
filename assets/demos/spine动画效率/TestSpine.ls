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
      "x": 443,
      "y": 1063,
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
    }
  ]
}