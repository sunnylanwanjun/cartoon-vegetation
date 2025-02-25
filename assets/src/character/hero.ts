
import { _decorator, Component, Node, Vec3, Vec2, Animation, lerp, AnimationClip, AnimationState, animation, AnimationComponent, RigidBody } from 'cc';
import input from '../utils/input';
const { ccclass, property, type } = _decorator;

let tempVec3 = new Vec3;

@ccclass('Hero')
export class Hero extends Component {
    @property
    moveSpeed = 10;

    @property
    runSpeed = 20;

    @type(Animation)
    animation: Animation = null;

    @type(RigidBody)
    rigidBody: RigidBody = null;

    @property
    jumpForce = 5;

    jumping = false;

    speed = new Vec3;
    targetSpeed = new Vec3;

    rotation = 0;
    targetRotation = 0;

    _currentAnim = '';

    start () {
        this.animation.on(AnimationComponent.EventType.STOP, this.onAnimationStop.bind(this))
    }

    play (name) {
        if (!this.animation) {
            return;
        }
        if (this._currentAnim === name) {
            let state = this.animation.getState(name);
            if (state.wrapMode !== AnimationClip.WrapMode.Normal) {
                return;
            }
        }
        this._currentAnim = name

        this.animation.crossFade(name, 0.1);
    }

    onAnimationStop (type, state) {
        if (state.name === 'UnarmedJumpRunning') {
            this.jumping = false;
        }
    }

    update (deltaTime: number) {
        // Your update function goes here.

        let moving = false;
        let speed = this.speed;
        let speedAmount = this.moveSpeed;
        if (input.key.shift) {
            speedAmount = this.runSpeed;
        }

        this.targetSpeed.x = this.targetSpeed.z = 0;

        if (input.key.left) {
            this.targetRotation += 90 * deltaTime;
        }
        else if (input.key.right) {
            this.targetRotation -= 90 * deltaTime;
        }

        let targetRotationRad = this.targetRotation * Math.PI / 180;
        if (input.key.up) {
            this.targetSpeed.x = speedAmount * Math.sin(targetRotationRad);
            this.targetSpeed.z = speedAmount * Math.cos(targetRotationRad);
            moving = true;
        }
        // else if (input.key.down) {
        //     this.targetSpeed.x = -speedAmount;
        //     moving = true;
        // }

        Vec3.lerp(speed, speed, this.targetSpeed, deltaTime * 5);


        if (input.key.space) {
            if (!this.jumping) {
                this.jumping = true;
                this.rigidBody.applyImpulse(tempVec3.set(0, this.jumpForce, 0));
            }
        }

        if (this.jumping) {

        }
        else if (moving) {
            if (input.key.shift) {
                this.play('FastRun');
            }
            else {
                this.play('Running');
            }
        }
        else {
            speed.x = speed.z = 0;
            this.play('Yawn');
        }

        this.rotation = this.targetRotation;//lerp(this.rotation, this.targetRotation, deltaTime * 5);

        this.rigidBody.getLinearVelocity(tempVec3);
        speed.y = tempVec3.y;
        this.rigidBody.setLinearVelocity(speed);

        if (this.speed.y < -3) {
            if (this._currentAnim !== 'JumpingDown') {
                this._currentAnim = 'JumpingDown';
                // this.play('JumpingDown')
            }
        }
        else if (this.speed.y > 3) {
            this.jumping = true;
            if (this._currentAnim !== 'JumpingUp') {
                this.play('JumpingUp')
            }
        }
        else if (this._currentAnim === 'JumpingDown') {
            this.jumping = false;
        }

        // model
        this.animation.node.eulerAngles = tempVec3.set(0, this.rotation, 0);

    }
}
