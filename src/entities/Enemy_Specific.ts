import Phaser from 'phaser';
import { PoolManager } from '../@types/Pool';
import { Enemy, YOUSEI1_TEXTURE } from './Enemy';
import { IEntity, IVectorPoint } from './Entity';
import { DATA_SHOTBLUE, DATA_SHOTRED } from '../objects/Projectile_Enemy' 
import { IWavePatternData, PPatternWave } from '../objects/Projectile';

export enum YOUSEI1_ANIMS{
    idle = 'yousei1_idle',
    run = 'yousei1_run',
}

const TEST_SHOT_DELAY = 500;

const Yousei1WaveData : IWavePatternData = {
    nextFire : 0,
    pSpeed : 250,
    fireRate : 40,
    wave: Phaser.Utils.Array.NumberArrayStep(-800, 800, 200).concat(Phaser.Utils.Array.NumberArrayStep(800, -800, -200)),
    waveIndex: 0,
}

export class Yousei1 extends Enemy{
    shootPoint: IVectorPoint;
    wavePattern: PPatternWave;

    constructor(scene: Phaser.Scene, { pos, texture, frame, offset }: IEntity){
        super(scene, { pos, texture, frame, offset }, 3, 3);
        this.setScale(2);

        this.shootPoint = {
            pos: new Phaser.Math.Vector2(0, 30), theta: Phaser.Math.DegToRad(90),
        }

        this.wavePattern = new PPatternWave(this, this.shootPoint, Enemy.redPManager.getGroup(DATA_SHOTRED.texture.key), Yousei1WaveData);
    }

    create(){
        super.create();

        this.anims.create({ key: YOUSEI1_ANIMS.idle, frames: this.anims.generateFrameNames(YOUSEI1_TEXTURE.key, { prefix: YOUSEI1_ANIMS.idle, end: 2, zeroPad: 4}), repeat: -1});
        this.anims.create({ key: YOUSEI1_ANIMS.run, frames: this.anims.generateFrameNames(YOUSEI1_TEXTURE.key, { prefix: YOUSEI1_ANIMS.run, end: 3, zeroPad: 4}), repeat: -1});
    }

    update() {
        super.update();

        this.anims.play(YOUSEI1_ANIMS.idle);

        // if(this.time() > this.lastShotTime){
        //     this.shoot();
        // }
        this.shoot();
    }

    protected shoot() {
        //this.spawnProjectile(DATA_SHOTRED.texture.key, this.shootPoint);
        this.wavePattern.updatePattern();
        this.lastShotTime = this.time() + TEST_SHOT_DELAY;
    }
}