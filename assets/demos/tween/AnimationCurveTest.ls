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
      "scriptPath": "demos/tween/AnimationCurveTest.ts",
      "animationCurve": {
        "_$type": "582992a0-a2fc-45a6-92d7-9517db859673"
      },
      "particleMinMaxCurve": {
        "_$type": "ParticleMinMaxCurve",
        "mode": 3,
        "curveMin": {
          "_$type": "GradientDataNumber",
          "_elements": {
            "_$type": "Float32Array",
            "value": [
              0,
              0,
              1,
              0.6363636255264282,
              0,
              0,
              0,
              0
            ]
          },
          "_currentLength": 8,
          "_curveMin": 0,
          "_curveMax": 1
        },
        "curveMax": {
          "_$type": "GradientDataNumber",
          "_elements": {
            "_$type": "Float32Array",
            "value": [
              0,
              0.28138527274131775,
              0.8924527764320374,
              0.5454545021057129,
              1,
              1,
              0,
              0
            ]
          },
          "_currentLength": 8,
          "_curveMin": 0,
          "_curveMax": 1
        }
      },
      "gradientDataNumber": {
        "_$type": "GradientDataNumber",
        "_elements": {
          "_$type": "Float32Array",
          "value": [
            0,
            0.013463156297802925,
            0.7566037774085999,
            1.9911141395568848,
            1,
            3.1099884510040283,
            0,
            0
          ]
        },
        "_currentLength": 8,
        "_curveMin": 0,
        "_curveMax": 4.078
      },
      "widthCurve": {
        "_$type": "FloatKeyframe",
        "inWeight": 0.33333,
        "outWeight": 0.33333,
        "weightedMode": 0
      }
    },
    {
      "_$type": "Trail2DRender",
      "layer": 0,
      "time": 0.5,
      "minVertexDistance": 0.1,
      "widthMultiplier": 49.926,
      "widthCurve": [
        {
          "_$type": "FloatKeyframe",
          "inTangent": 0,
          "outTangent": 0,
          "value": 1,
          "inWeight": 0.33333,
          "outWeight": 0.33333,
          "weightedMode": 0,
          "time": 0
        },
        {
          "_$type": "FloatKeyframe",
          "inTangent": 0,
          "outTangent": 0,
          "value": 1,
          "inWeight": 0.33333,
          "outWeight": 0.33333,
          "weightedMode": 0,
          "time": 1
        }
      ],
      "color": {
        "_$type": "Color"
      },
      "colorGradient": {
        "_$type": "Gradient",
        "_alphaElements": {
          "_$type": "Float32Array",
          "value": [
            0,
            1,
            1,
            1,
            0,
            0,
            0,
            0
          ]
        },
        "_colorAlphaKeysCount": 2,
        "_rgbElements": {
          "_$type": "Float32Array",
          "value": [
            0,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ]
        },
        "_colorRGBKeysCount": 2
      },
      "texture": {
        "_$uuid": "00000000-0000-0000-0001-000000000000",
        "_$type": "Texture2D"
      }
    }
  ]
}