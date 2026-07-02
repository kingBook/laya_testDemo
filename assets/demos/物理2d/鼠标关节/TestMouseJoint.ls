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
      "_$id": "slrd4y7i",
      "_$type": "Sprite",
      "name": "body",
      "x": 227,
      "y": 965,
      "width": 100,
      "height": 100,
      "_gcmds": [
        {
          "_$type": "DrawRectCmd",
          "fillColor": "#173cda"
        }
      ],
      "_$comp": [
        {
          "_$id": "2nul",
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
          "_$id": "m1kd",
          "_$type": "MouseJoint",
          "maxForce": 1000
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
    }
  ]
}