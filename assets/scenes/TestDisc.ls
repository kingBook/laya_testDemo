{
  "_$ver": 1,
  "_$id": "5myind7y",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "Scene2D",
  "width": 750,
  "height": 1600,
  "_$child": [
    {
      "_$id": "8kko1mee",
      "_$type": "Box",
      "name": "LuckWheel",
      "x": 375,
      "y": 800,
      "width": 750,
      "height": 750,
      "anchorX": 0.5,
      "anchorY": 0.5,
      "centerX": 0,
      "centerY": 0,
      "_$comp": [
        {
          "_$type": "084c02c5-8249-42bc-a85c-41ba3bac30e2",
          "scriptPath": "../src/kingBook/components/luckWheel/LuckWheel.ts",
          "gizmoVisible": true,
          "gizmoOutsideRadius": 100,
          "gizmoInnerRadius": 5,
          "_mode": 1,
          "_pointer": {
            "_$ref": "wgqhu2s7"
          },
          "_outsideDisc": {
            "_$ref": "8u8g4fnt"
          },
          "_innerDisc": {
            "_$ref": "r99hso73"
          },
          "_pointerAngleOffset": 90,
          "_pointerRpm": 14,
          "_outsideDiscRpm": 14,
          "_innerDiscRpm": 14,
          "_outsideDiscSplitAngles": [
            0,
            45,
            90
          ],
          "_innerDiscSplitAngles": [
            0,
            180
          ]
        }
      ],
      "_$child": [
        {
          "_$id": "ss2k2c3z",
          "_$type": "Image",
          "name": "bg",
          "active": false,
          "x": 375,
          "y": 375,
          "width": 750,
          "height": 750,
          "anchorX": 0.5,
          "anchorY": 0.5,
          "visible": false,
          "color": "#ffffff"
        },
        {
          "_$id": "8u8g4fnt",
          "_$type": "Sprite",
          "name": "discOutside",
          "x": 375,
          "y": 375,
          "width": 100,
          "height": 100,
          "anchorX": 0.5,
          "anchorY": 0.5,
          "_gcmds": [
            {
              "_$type": "DrawPieCmd",
              "x": 50,
              "y": 50,
              "radius": 320,
              "startAngle": 0,
              "endAngle": 360,
              "fillColor": "rgba(124,39,39,0.5019607843137255)",
              "lineColor": "#ff0000",
              "lineWidth": 3
            }
          ]
        },
        {
          "_$id": "r99hso73",
          "_$type": "Sprite",
          "name": "discInner",
          "x": 375,
          "y": 375,
          "width": 100,
          "height": 100,
          "anchorX": 0.5,
          "anchorY": 0.5,
          "_gcmds": [
            {
              "_$type": "DrawPieCmd",
              "x": 50,
              "y": 50,
              "radius": 150,
              "startAngle": 0,
              "endAngle": 360,
              "fillColor": "rgba(37,128,127,0.5019607843137255)",
              "lineColor": "#00fff6",
              "lineWidth": 3
            }
          ]
        },
        {
          "_$id": "wgqhu2s7",
          "_$type": "Image",
          "name": "pointer",
          "x": 375,
          "y": 88,
          "width": 70,
          "height": 76,
          "anchorX": 0.5,
          "anchorY": 1,
          "skin": "res://118daf0b-b355-4bea-8b76-b24bbed69583",
          "useSourceSize": true,
          "color": "#ffffff"
        }
      ]
    }
  ]
}