{
  "_$ver": 1,
  "_$id": "i9qnbypy",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestSpineTime",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "820165ff-c2c5-456e-9a31-6f1179093161",
      "scriptPath": "demos/spine动画效率/TestSpineBonePos.ts",
      "_spineNode": {
        "_$ref": "bw00r7tp",
        "_$type": "Spine2DRenderNode"
      },
      "_circleSprite": {
        "_$ref": "q5ev6sj8"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "bw00r7tp",
      "_$type": "Sprite",
      "name": "hero-pro",
      "x": 233,
      "y": 978,
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
          "animationName": "idle",
          "preview": true,
          "physicsUpdate": 2
        }
      ]
    },
    {
      "_$id": "q5ev6sj8",
      "_$type": "Sprite",
      "name": "Circle",
      "x": 1,
      "y": 644,
      "width": 100,
      "height": 100,
      "_gcmds": [
        {
          "_$type": "DrawCircleCmd",
          "x": 0,
          "y": 0,
          "radius": 0.2,
          "percent": true,
          "lineWidth": 1,
          "lineColor": "rgba(0,0,0,0.403921568627451)",
          "fillColor": "rgba(82,255,11,0.4)"
        }
      ]
    }
  ]
}