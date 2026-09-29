{
  "_$ver": 1,
  "_$id": "pw4fkvnp",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "ReynoldsWander",
  "width": 750,
  "height": 1600,
  "_$child": [
    {
      "_$id": "4d1fhar3",
      "_$type": "Sprite",
      "name": "Agent",
      "x": 381,
      "y": 806,
      "width": 50,
      "height": 50,
      "anchorX": 0.5,
      "anchorY": 0.5,
      "_gcmds": [
        {
          "_$type": "DrawCircleCmd",
          "x": 0.5,
          "y": 0.5,
          "radius": 0.5,
          "percent": true,
          "lineWidth": 1,
          "fillColor": "#ffffff"
        },
        {
          "_$type": "DrawLineCmd",
          "fromX": 0.5,
          "fromY": 0.5,
          "toX": 1.2,
          "toY": 0.5,
          "percent": true,
          "lineWidth": 10,
          "lineColor": "#fb0404"
        }
      ],
      "_$comp": [
        {
          "_$type": "aea3f499-609e-4259-b9c0-bdd69d959060",
          "scriptPath": "demos/AI/徘徊/Agent.ts"
        }
      ]
    }
  ]
}