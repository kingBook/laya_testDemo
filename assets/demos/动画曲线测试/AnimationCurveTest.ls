{
  "_$ver": 1,
  "_$id": "5v9sqaz7",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "AnimationCurveTest",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "30fb7f5b-3878-4677-b7b1-8a2630e8e02d",
      "scriptPath": "demos/动画曲线测试/AnimationCurveTest.ts",
      "aniCurve": {
        "_$type": "582992a0-a2fc-45a6-92d7-9517db859673",
        "keys": [
          {
            "_$type": "FloatKeyframe",
            "inTangent": 0,
            "outTangent": 0.4,
            "value": 0,
            "inWeight": 0,
            "outWeight": 0.25,
            "weightedMode": 0,
            "time": 0
          },
          {
            "_$type": "FloatKeyframe",
            "inTangent": 0,
            "outTangent": 0,
            "value": 1,
            "inWeight": 0.75,
            "outWeight": 0,
            "weightedMode": 0,
            "time": 1
          }
        ]
      },
      "aniCurve2": {
        "_$type": "582992a0-a2fc-45a6-92d7-9517db859673",
        "keys": [
          {
            "_$type": "FloatKeyframe",
            "inTangent": 0,
            "outTangent": 1,
            "value": 0,
            "inWeight": 0,
            "outWeight": 2.220446049250313e-16,
            "weightedMode": 0,
            "time": 0
          },
          {
            "_$type": "FloatKeyframe",
            "inTangent": 0,
            "outTangent": 0,
            "value": 1,
            "inWeight": 2.220446049250313e-16,
            "outWeight": 0,
            "weightedMode": 0,
            "time": 1
          }
        ]
      },
      "aniCurve3": {
        "_$type": "582992a0-a2fc-45a6-92d7-9517db859673",
        "keys": [
          {
            "_$type": "FloatKeyframe",
            "inTangent": 0,
            "outTangent": 0,
            "value": 0,
            "inWeight": 0,
            "outWeight": 0.42,
            "weightedMode": 0,
            "time": 0
          },
          {
            "_$type": "FloatKeyframe",
            "inTangent": 0,
            "outTangent": 0,
            "value": 1,
            "inWeight": 0.42000000000000004,
            "outWeight": 0,
            "weightedMode": 0,
            "time": 1
          }
        ]
      },
      "box": {
        "_$ref": "kbuilyqp"
      },
      "box2": {
        "_$ref": "mt72uuha"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "kbuilyqp",
      "_$type": "Box",
      "name": "Box",
      "x": 375,
      "y": 120,
      "width": 200,
      "height": 200,
      "anchorX": 0.5,
      "anchorY": 0.5,
      "bgColor": "#ffffff"
    },
    {
      "_$id": "mt72uuha",
      "_$type": "Box",
      "name": "Box2",
      "x": 615,
      "y": 120,
      "width": 200,
      "height": 200,
      "anchorX": 0.5,
      "anchorY": 0.5,
      "bgColor": "#a0e7b4"
    }
  ]
}