{
  "_$ver": 1,
  "_$id": "xu2za9gj",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "TestMouseJoint",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "668f77a7-dbb9-489a-9265-781b368826ca",
      "scriptPath": "demos/物理2d/鼠标关节/TestMouseJoint.ts",
      "_mouseJoint": {
        "_$ref": "eryko2xy",
        "_$type": "MouseJoint"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "eryko2xy",
      "_$type": "Sprite",
      "name": "body",
      "x": 227,
      "y": 668,
      "width": 100,
      "height": 100,
      "_gcmds": [
        {
          "_$type": "DrawPolyCmd",
          "x": 0,
          "y": 0,
          "points": [
            54,
            -9,
            234,
            10,
            307.03571764423475,
            136.909339367602,
            262.34726043094315,
            180.23204297941737,
            195.9923603455552,
            116.62365197825801,
            143.20856519767125,
            58.46810073802281,
            115.4905991590117,
            114.39699004060195,
            0,
            100
          ],
          "lineWidth": 1,
          "lineColor": "#000000",
          "fillColor": "#3af080"
        },
        {
          "_$type": "DrawPolyCmd",
          "x": 0,
          "y": 0,
          "points": [
            117.36257214098174,
            112.02456119439601,
            139.87659088687582,
            58.48628137714557,
            199,
            122,
            263.1621218289581,
            180.3624691755829,
            304.96645897006874,
            138.515328121212,
            280,
            327,
            0,
            100
          ],
          "lineWidth": 1,
          "lineColor": "#000000",
          "fillColor": "#516bda"
        }
      ],
      "_$comp": [
        {
          "_$id": "8ob2",
          "_$type": "RigidBody",
          "applyOwnerColliderComponent": false,
          "shapes": [
            {
              "_$type": "PolygonShape2D",
              "x": 0,
              "y": 0,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "datas": [
                50,
                0,
                234.1,
                11.69,
                303.24,
                130.8,
                252.34,
                171.85,
                197.12,
                120.6,
                145,
                47,
                108.34,
                111.36,
                0,
                100
              ]
            },
            {
              "_$type": "PolygonShape2D",
              "x": 0,
              "y": 0,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "datas": [
                109,
                114,
                145.9,
                45.23,
                197.66,
                118.95,
                255,
                174,
                307.21,
                128.89,
                279.56,
                328.05,
                0,
                100
              ]
            }
          ]
        },
        {
          "_$id": "p9kh",
          "_$type": "MouseJoint",
          "anchor": [
            0,
            0
          ],
          "maxForce": 100000,
          "damping": 0
        }
      ]
    },
    {
      "_$id": "csjbwh3z",
      "_$type": "Sprite",
      "name": "staticGround",
      "x": 118,
      "y": 1090,
      "width": 521,
      "height": 100,
      "_gcmds": [
        {
          "_$type": "DrawRectCmd",
          "fillColor": "#ffffff"
        }
      ],
      "_$comp": [
        {
          "_$id": "y9zp",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 0,
              "y": 0,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "width": 521,
              "height": 100
            }
          ]
        }
      ]
    },
    {
      "_$id": "shdwhxt3",
      "_$type": "Sprite",
      "name": "mouseBody",
      "x": 369,
      "y": 605,
      "width": 100,
      "height": 100,
      "_$comp": [
        {
          "_$id": "fkpj",
          "_$type": "RigidBody",
          "type": "kinematic",
          "applyOwnerColliderComponent": false
        }
      ]
    }
  ]
}