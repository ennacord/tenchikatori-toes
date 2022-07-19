import Phaser from 'phaser';
import { IEntity, Entity, IVectorPoint, COLLISION_CATEGORIES, ITexture, IFunctionDelegate } from '../Entity';
import { PoolManager } from '../../@types/Pool';
import eventsCenter from '../../plugins/EventsCentre';
import { DATA_POWER_ITEM, DATA_SCORE_ITEM, ItemManager, ITEM_POOL, PowerItem, ScoreItem } from '../projectiles/items/Item';
import { Projectile } from '../projectiles/Projectile';

export interface ICharacter extends IEntity{
    hp: number,
    speed?: number,
}

export interface IAnimation{
    key: string,
    end: number,
    pad: number, 
}

export class Character extends Entity{
    static itemManager: ItemManager;
    hp: number;
    lastShotTime: number;

    constructor(scene: Phaser.Scene, data: ICharacter){
        super(scene, { pos: data.pos, texture: data.texture, hitSize: data.hitSize, frame: data.frame }, true);

        this.hp = data.hp;
        this.lastShotTime = 0;
    }

    time(){
        //return this.scene.time.now;
        return this.scene.game.getTime();
    }

    static initManager(scene: Phaser.Scene){
        Character.itemManager = new ItemManager(scene);
        Character.itemManager.addGroup(DATA_POWER_ITEM.texture.key, PowerItem, ITEM_POOL);
        Character.itemManager.addGroup(DATA_SCORE_ITEM.texture.key, ScoreItem, ITEM_POOL);
    }

    // create(){
    //     super.create();
    // }

    handleCollision(p: Projectile){
        super.handleCollision(p);
    }

    handleCollisionChar(char: Character){}

    protected moveVertically(speed: number){
        //this.y += speed;
        this.setVelocityY(speed);
    }

    protected moveHorizontally(speed: number){
        //this.x += speed;
        this.setVelocityX(speed);
    }

    protected spawnProjectile(manager: PoolManager, name: string, point: IVectorPoint){
        return manager.spawnInstance(name, { pos: new Phaser.Math.Vector2(this.x + point.pos.x, this.y + point.pos.y), theta: point.theta });
    }

    protected createAnimation(data: Array<IAnimation>, parent: string){
        data.forEach(a =>{
            this.anims.create({ key: a.key, frames: this.anims.generateFrameNames(parent, { prefix: a.key, end: a.end, zeroPad: a.pad }), repeat: -1 });
        });
    }
}