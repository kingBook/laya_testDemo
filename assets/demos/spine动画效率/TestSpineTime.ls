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
      "_$type": "a3427c69-15eb-44d3-83ee-dc5b38cbe91f",
      "scriptPath": "demos/spine动画效率/TestSpineTime.ts",
      "_spineNode": {
        "_$ref": "bw00r7tp",
        "_$type": "Spine2DRenderNode"
      }
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
          "animationName": "jump",
          "preview": true,
          "physicsUpdate": 2
        }
      ]
    }
  ]
}