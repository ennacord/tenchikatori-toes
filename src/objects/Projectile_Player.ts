import Phaser from 'phaser';
import { COLLISION_CATEGORIES } from '../entities/Entity';
import { Player } from '../entities/Player';
import { Projectile, IProjectileData } from './Projectile';
import { IVectorPoint, ITexture } from '../entities/Entity';

export interface IShootPoints{
    point_1: IVectorPoint,
    point_2: IVectorPoint,
    point_3: IVectorPoint,
    point_4: IVectorPoint,
}

export const PLAYER_SHOOT_DELAY = 60;
export const PLAYER_PROJECTILE_POOL = 40;

export const DATA_PLAYER_P1 : IProjectileData = {
    pos: Phaser.Math.Vector2.ZERO,
    texture: { key: 'card1', path: 'assets/sprites/touhou_test/card1.png' },
    speed: 600,
    damage: 1,
}

export const DATA_PLAYER_P2 : IProjectileData = {
    pos: Phaser.Math.Vector2.ZERO,
    texture: { key: 'card2', path: 'assets/sprites/touhou_test/card2.png' },
    speed: 600,
    damage: 1,
}

export const DATA_PLAYER_PMOON : IProjectileData = {
    pos: Phaser.Math.Vector2.ZERO,
    texture: { key: 'moon', path: 'assets/sprites/touhou_test/moon.png' },
    speed: 600,
    damage: 3,
}

export const SHOOTPOINTS_NORMAL : IShootPoints = {
    point_1: { pos: new Phaser.Math.Vector2(-20, -60), theta: Phaser.Math.DegToRad(0) },
    point_2: { pos: new Phaser.Math.Vector2(20, -60), theta: Phaser.Math.DegToRad(0) },
    point_3: { pos: new Phaser.Math.Vector2(60, -40), theta: Phaser.Math.DegToRad(15) },
    point_4: { pos: new Phaser.Math.Vector2(-60, -40), theta: Phaser.Math.DegToRad(-15) },
}

export const SHOOTPOINTS_FOCUSED : IShootPoints = {
    point_1: { pos: new Phaser.Math.Vector2(-12, -60), theta: Phaser.Math.DegToRad(0) },
    point_2: { pos: new Phaser.Math.Vector2(12, -60), theta: Phaser.Math.DegToRad(0) },
    point_3: { pos: new Phaser.Math.Vector2(36, -50), theta: Phaser.Math.DegToRad(0) },
    point_4: { pos: new Phaser.Math.Vector2(-36, -50), theta: Phaser.Math.DegToRad(0) },
}

class PlayerPorjectile extends Projectile{
    constructor(scene: Phaser.Scene, data: IProjectileData){
        super(scene, data);
    }

    protected move(point: IVectorPoint, speed: number){
        //this.scene.physics.velocityFromRotation(point.theta, speed, this.body.velocity);
        let velocity = new Phaser.Math.Vector2(Math.sin(point.theta), -Math.cos(point.theta)).normalize().scale(speed);
        this.setVelocity(velocity.x, velocity.y);
        this.setRotation(point.theta);
    }
}

export class PlayerShot1 extends PlayerPorjectile{
    constructor(scene: Phaser.Scene){
        super(scene, DATA_PLAYER_P1);
    }

    updateTransform(point: IVectorPoint) {
        super.updateTransform(point);
        this.move(point, DATA_PLAYER_P1.speed);
    }
}

export class PlayerShot2 extends PlayerPorjectile{
    constructor(scene: Phaser.Scene){
        super(scene, DATA_PLAYER_P2);
    }

    updateTransform(point: IVectorPoint) {
        super.updateTransform(point);
        this.move(point, DATA_PLAYER_P2.speed);
    }
}