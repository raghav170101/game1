import { Crate } from './crate'
import { Score } from './prize'
import * as utils from '@dcl/ecs-scene-utils'

// Base
const base = new Entity()
base.addComponent(new GLTFShape('models/baseLight.glb'))
engine.addEntity(base)

// Configuration
const Z_OFFSET = 1.5
const GROUND_HEIGHT = 0.55

// Crate
const crate = new Crate(
  new GLTFShape('models/crate.glb'),
  new Transform({
    position: new Vector3(8, GROUND_HEIGHT, 8)
  })
)
//voucher
const scoreTen = new Score(new GLTFShape('models/voucher1.glb'), new Transform())

//coupon
crate.addComponent(
  new utils.ToggleComponent(utils.ToggleState.Off, (value) => {
    if (value === utils.ToggleState.On) {
      // open
      score(value.hit.meshName, value.hit.hitPoint)
      // doorPivot.addComponentOrReplace(
      //   new utils.RotateTransformComponent(
      //     doorPivot.getComponent(Transform).rotation,
      //     openPos,
      //     0.5
      //   )
      // )
    } else {
      // close
      // doorPivot.addComponentOrReplace(
      //   new utils.RotateTransformComponent(
      //     doorPivot.getComponent(Transform).rotation,
      //     closedPos,
      //     0.5
      //   )
      // )
    }
  })
)

//click
crate.addComponent(
  new OnPointerDown(
    (e) => {
      crate.getComponent(utils.ToggleComponent).toggle()
    },
    { button: ActionButton.POINTER, hoverText: 'Open/Close' }
  )
)

// Sounds
const pickUpSound = new Entity()
pickUpSound.addComponent(new AudioSource(new AudioClip('sounds/pickUp.mp3')))
pickUpSound.addComponent(new Transform())
engine.addEntity(pickUpSound)
pickUpSound.setParent(Attachable.AVATAR)

const putDownSound = new Entity()
putDownSound.addComponent(new AudioSource(new AudioClip('sounds/putDown.mp3')))
putDownSound.addComponent(new Transform())
engine.addEntity(putDownSound)
putDownSound.setParent(Attachable.AVATAR)

// Controls
Input.instance.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (e) => {
  const transform = crate.getComponent(Transform)
  if (!crate.isGrabbed) {
    crate.isGrabbed = true
    pickUpSound.getComponent(AudioSource).playOnce()

    // Calculates the crate's position relative to the camera
    transform.position = Vector3.Zero()
    transform.rotation = Quaternion.Zero()
    transform.position.z += Z_OFFSET
    crate.setParent(Attachable.AVATAR)
  } else {
    crate.isGrabbed = false
    putDownSound.getComponent(AudioSource).playOnce()

    // Calculate crate's ground position
    crate.setParent(null) // Remove parent
    const forwardVector: Vector3 = Vector3.Forward().scale(Z_OFFSET).rotate(Camera.instance.rotation)
    transform.position = Camera.instance.position.clone().add(forwardVector)
    transform.lookAt(Camera.instance.position)
    transform.rotation.x = 0
    transform.rotation.z = 0
    transform.position.y = GROUND_HEIGHT
  }
})

const DELETE_TIME = 8
Input.instance.subscribe('BUTTON_DOWN', ActionButton.POINTER, true, (e) => {
      // Calculate the position of where the bullet hits relative to the target
      const targetPosition =
        engine.entities[e.hit.entityId].getComponent(Transform).position
      const relativePosition = e.hit.hitPoint.subtract(targetPosition)
      const bulletMark = new BulletMark(bulletMarkShape, DELETE_TIME)
      bulletMark.setParent(engine.entities[e.hit.entityId]) // Make the bullet mark the child of the target so that it remains on the target
      bulletMark.getComponent(Transform).position = relativePosition
       // Play score animation
})

function score(targetHit: string, targetPosition: Vector3): void {
  switch (targetHit) {
    case 'target10_collider':
      scoreTen.getComponent(Transform).position = targetPosition
      scoreTen.getComponent(Transform).position.z -= 0.5
      scoreTen.playAnimation()
      break
    // case 'target25_collider':
    //   scoreTwentyFive.getComponent(Transform).position = targetPosition
    //   scoreTwentyFive.getComponent(Transform).position.z -= 0.5
    //   scoreTwentyFive.playAnimation()
    //   break
    // case 'target50_collider':
    //   scoreFifty.getComponent(Transform).position = targetPosition
    //   scoreFifty.getComponent(Transform).position.z -= 0.5
    //   scoreFifty.playAnimation()
    //   break
  }
}