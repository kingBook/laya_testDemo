{
  "_$ver": 1,
  "_$id": "m5pbx6t0",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "testBody",
  "width": 750,
  "height": 1600,
  "_$comp": [
    {
      "_$type": "e4c7f2de-bb74-450f-a944-4275704c8261",
      "scriptPath": "scenes/testPhysics2d/TestBody.ts",
      "polygon_graphics": {
        "_$ref": "u0q3ofw4"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "6agjc0ib",
      "_$type": "Sprite",
      "name": "ground",
      "x": 9,
      "y": 1312,
      "width": 744,
      "height": 100,
      "_$comp": [
        {
          "_$id": "8y97",
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
              "width": 748,
              "height": 100
            }
          ]
        }
      ]
    },
    {
      "_$id": "phvbaoss",
      "_$type": "Sprite",
      "name": "Box",
      "x": 334,
      "y": 714,
      "width": 100,
      "height": 100,
      "_$comp": [
        {
          "_$id": "xule",
          "_$type": "RigidBody",
          "applyOwnerColliderComponent": false,
          "shapes": [
            {
              "_$type": "BoxShape2D",
              "x": 0,
              "y": 0,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "width": 100,
              "height": 100
            }
          ]
        },
        {
          "_$type": "cbcb1047-4343-4d9b-9fc5-ab485135e8c8",
          "scriptPath": "scenes/testPhysics2d/Box.ts"
        }
      ]
    },
    {
      "_$id": "tt9nbgfk",
      "_$type": "Sprite",
      "name": "polygon",
      "x": 443,
      "y": 402,
      "width": 100,
      "height": 100,
      "_$comp": [
        {
          "_$id": "7fr2",
          "_$type": "RigidBody",
          "applyOwnerColliderComponent": false,
          "shapes": [
            {
              "_$type": "PolygonShape2D",
              "x": -21,
              "y": -18,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "datas": [
                -178.85,
                -18.76,
                -40.19,
                -71.5,
                50,
                0,
                100,
                100,
                36.78,
                79.66,
                -5.88,
                5.53,
                -79.54,
                -13.43,
                -268,
                140
              ]
            }
          ]
        }
      ]
    },
    {
      "_$id": "lnug7y7e",
      "_$type": "Sprite",
      "name": "polygon_static",
      "x": 9,
      "y": 1312,
      "width": 744,
      "height": 100,
      "_$comp": [
        {
          "_$id": "8y97",
          "_$type": "StaticCollider",
          "shapes": [
            {
              "_$type": "PolygonShape2D",
              "x": -52,
              "y": -120,
              "density": 10,
              "restitution": 0,
              "restitutionThreshold": 1,
              "friction": 0.2,
              "datas": [
                2,
                -180,
                186.71,
                1.42,
                739.65,
                -28.43,
                844.9,
                -221.61,
                795.31,
                67.75,
                350.24,
                115.53,
                100,
                100,
                0,
                100
              ]
            }
          ]
        }
      ]
    },
    {
      "_$id": "u0q3ofw4",
      "_$type": "Sprite",
      "name": "polygon_graphics",
      "x": 359,
      "y": 786,
      "width": 100,
      "height": 100,
      "_gcmds": [
        {
          "_$type": "DrawPolyCmd",
          "x": 0,
          "y": 0,
          "points": [
            -31,
            36.57433985343676,
            0,
            0,
            62.25490289243726,
            -29.96599584882798,
            54.59317644132952,
            54.068975275136275,
            146.90711816868873,
            71.29026501583907,
            243.47305271735632,
            41.8618253801176,
            346,
            30,
            324.4378769310414,
            101.5416579955501,
            308.0769653032645,
            231.41128341632972,
            230.6300871071768,
            188.36540868701871,
            237.150369949511,
            132.07940492350934,
            117.32363009632009,
            131.14094486809293,
            0,
            100
          ],
          "lineWidth": 1,
          "lineColor": "#000000",
          "fillColor": "#ffffff"
        }
      ]
    }
  ]
}