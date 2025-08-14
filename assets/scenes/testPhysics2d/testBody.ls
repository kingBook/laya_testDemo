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
      "x": 312,
      "y": 616,
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
      "_$id": "u0q3ofw4",
      "_$type": "Sprite",
      "name": "polygon_graphics",
      "x": 232,
      "y": 725,
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
            239.73232985337233,
            23.916530015471892,
            207.47305271735632,
            -63.13817461988239,
            305.18531389811994,
            -90.26919654625642,
            346,
            30,
            324.4378769310414,
            101.5416579955501,
            403.5406558598658,
            75.98751891247917,
            415.6325133341504,
            191.43686298403796,
            308.0769653032645,
            231.41128341632972,
            330.40692640224023,
            343.23730496842643,
            205.12194535756015,
            252.75393358939516,
            83.04735877649875,
            298.65168547388316,
            -72.75509957020233,
            250.6047241090223,
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
          "fillColor": "rgba(0,255,244,0.3176470588235294)"
        }
      ],
      "_$comp": [
        {
          "_$id": "2pmd",
          "_$type": "RigidBody",
          "applyOwnerColliderComponent": false
        }
      ]
    },
    {
      "_$id": "ya72hkq8",
      "_$type": "Sprite",
      "name": "roundRect",
      "x": 513,
      "y": 454,
      "width": 100,
      "height": 100,
      "_gcmds": [
        {
          "_$type": "DrawRoundRectCmd",
          "lt": 20,
          "rt": 20,
          "lb": 20,
          "rb": 20,
          "fillColor": "#ffffff"
        }
      ]
    }
  ]
}