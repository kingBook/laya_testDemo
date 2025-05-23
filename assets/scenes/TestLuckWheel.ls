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
          "mode": 4,
          "gizmoVisible": true,
          "gizmoOutsideRadius": 314,
          "gizmoInnerRadius": 152,
          "pointer": {
            "_$ref": "jrcr0gae"
          },
          "pointerAngleOffset": 90,
          "pointerRpm": 14,
          "outsideDisc": {
            "_$ref": "8u8g4fnt"
          },
          "outsideDiscRpm": 13.4,
          "outsideSplitAngles": [
            10.1,
            57.5,
            142.8,
            210.9,
            275.6
          ],
          "innerDisc": {
            "_$ref": "r99hso73"
          },
          "innerDiscRpm": 12.7,
          "innerSplitAngles": [
            0,
            67.1,
            134.2,
            224.3
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
          "name": "outsideDisc",
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
              "lineColor": "#000000",
              "lineWidth": 3
            }
          ],
          "_$child": [
            {
              "_$id": "47wcr4fg",
              "_$type": "Label",
              "name": "0",
              "x": 232,
              "y": 163,
              "width": 44,
              "height": 88,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "text": "0",
              "fontSize": 87,
              "color": "#ff0000",
              "fitContent": "yes",
              "align": "center",
              "valign": "middle"
            },
            {
              "_$id": "f5u08tjr",
              "_$type": "Label",
              "name": "1",
              "x": -5,
              "y": 240,
              "width": 44,
              "height": 88,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "text": "1",
              "fontSize": 87,
              "color": "#ff0000",
              "fitContent": "yes",
              "align": "center",
              "valign": "middle"
            },
            {
              "_$id": "5stkl4p5",
              "_$type": "Label",
              "name": "2",
              "x": -152,
              "y": 69,
              "width": 44,
              "height": 88,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "text": "2",
              "fontSize": 87,
              "color": "#ff0000",
              "fitContent": "yes",
              "align": "center",
              "valign": "middle"
            },
            {
              "_$id": "dx0ctsak",
              "_$type": "Label",
              "name": "3",
              "x": -45,
              "y": -114,
              "width": 44,
              "height": 88,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "text": "3",
              "fontSize": 87,
              "color": "#ff0000",
              "fitContent": "yes",
              "align": "center",
              "valign": "middle"
            },
            {
              "_$id": "1y4yijwt",
              "_$type": "Label",
              "name": "4",
              "x": 191,
              "y": -74,
              "width": 44,
              "height": 88,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "text": "4",
              "fontSize": 87,
              "color": "#ff0000",
              "fitContent": "yes",
              "align": "center",
              "valign": "middle"
            }
          ]
        },
        {
          "_$id": "r99hso73",
          "_$type": "Sprite",
          "name": "innerDisc",
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
          ],
          "_$child": [
            {
              "_$id": "59z0h6g0",
              "_$type": "Label",
              "name": "0",
              "x": 152,
              "y": 94,
              "width": 30,
              "height": 61,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "text": "0",
              "fontSize": 60,
              "color": "#00fffd",
              "fitContent": "yes",
              "align": "center",
              "valign": "middle"
            },
            {
              "_$id": "qxydwldj",
              "_$type": "Label",
              "name": "1",
              "x": 38,
              "y": 146,
              "width": 30,
              "height": 61,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "text": "1",
              "fontSize": 60,
              "color": "#00fffd",
              "fitContent": "yes",
              "align": "center",
              "valign": "middle"
            },
            {
              "_$id": "31lxb4uu",
              "_$type": "Label",
              "name": "2",
              "x": -30,
              "y": 57,
              "width": 30,
              "height": 61,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "text": "2",
              "fontSize": 60,
              "color": "#00fffd",
              "fitContent": "yes",
              "align": "center",
              "valign": "middle"
            },
            {
              "_$id": "ssoboss4",
              "_$type": "Label",
              "name": "3",
              "x": 82,
              "y": -22,
              "width": 30,
              "height": 61,
              "anchorX": 0.5,
              "anchorY": 0.5,
              "text": "3",
              "fontSize": 60,
              "color": "#00fffd",
              "fitContent": "yes",
              "align": "center",
              "valign": "middle"
            }
          ]
        },
        {
          "_$id": "jrcr0gae",
          "_$type": "Sprite",
          "name": "pointer",
          "x": 375,
          "y": 88,
          "width": 70,
          "height": 76,
          "anchorX": 0.5,
          "anchorY": 1,
          "_gcmds": [
            {
              "_$type": "DrawPolyCmd",
              "x": 0,
              "y": 0,
              "points": [
                0,
                0,
                70,
                0,
                35,
                76
              ],
              "lineWidth": 1,
              "lineColor": "#000000",
              "fillColor": "#ffce06"
            }
          ]
        }
      ]
    }
  ]
}