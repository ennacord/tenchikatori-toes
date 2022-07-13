import Phaser, { Physics } from 'phaser';
import {IEntity, IVectorPoint, IFunctionDelegate, COLLISION_CATEGORIES, Entity, ITexture } from './Entity';
import { InputHandler, INPUT_EVENTS } from '../plugins/InputHandler';
import { PoolManager } from '../@types/Pool';
import eventsCenter from '../plugins/EventsCentre';
import { IShootPoints, DATA_PLAYER_P1, DATA_PLAYER_P2, DATA_PLAYER_PMOON, PLAYER_SHOOT_DELAY, SHOOTPOINTS_NORMAL, SHOOTPOINTS_FOCUSED, PLAYER_PROJECTILE_POOL, PlayerShot1, PlayerShot2 } from '../objects/Projectile_Player';
import { Character } from './Character';

export enum PLAYER_STATE{
    NORMAL,
    FOCUSED,
}

export enum PLAYER_EVENTS{
    special = 'special',
}

export const PLAYER_TEXTURE : ITexture = {
    key: 'enna', path: 'assets/sprites/touhouenna.png',
};

const SPEED_NORMAL = 250;
const SPEED_FOCUSED = SPEED_NORMAL*.5;

const HITBOX_TEXTURE: ITexture = {
    key: 'hitbox', path: 'assets/sprites/hitbox.png',
};
const HITBOX_SIZE = 8;
const HITBOX_OFFSET = -HITBOX_SIZE/4;

const GRAZEHB_SIZE = 60;

const MODE_IDICATOR_SIZE = 20;
const MODE_IDICATOR_OFFSET = new Phaser.Math.Vector2(-MODE_IDICATOR_SIZE/2, GRAZEHB_SIZE + 10 -MODE_IDICATOR_SIZE/2);

const BLUE_MODE: ITexture = {
    key: 'bluemode', path: 'assets/sprites/bluemode.png',
};
const RED_MODE: ITexture = {
    key: 'redmode', path: 'assets/sprites/redmode.png',
};

export class Player extends Character{
    actionDelegate : IFunctionDelegate;
    inputHandlingDelegate: IFunctionDelegate;

    bodyOffset: Phaser.Math.Vector2;

    hitbox: Entity;
    modeIndicator: Entity;

    projectileManager: PoolManager;
    currShootPoints : IShootPoints;
    shots : Function[];
    shotCounts : number;
    
    specials: number;
    castingSpecial: boolean;

    constructor(scene: Phaser.Scene, { pos, texture, frame, offset }: IEntity){
        let shapes = scene.game.cache.json.get('shapes');
        
        super(scene, { pos, texture, hitSize: new Phaser.Math.Vector2(GRAZEHB_SIZE, GRAZEHB_SIZE) , frame, offset }, 3, SPEED_NORMAL);
        
        this.actionDelegate = this.shoot;
        this.inputHandlingDelegate = this.inputHandling;

        this.bodyOffset = new Phaser.Math.Vector2(this.x - this.body.x, this.y - this.body.y);
        
        this.hitbox = new Entity(scene, { pos, texture: HITBOX_TEXTURE}, true);
        this.hitbox.setScale(HITBOX_SIZE/this.hitbox.width);
        this.hitbox.setVisible(false);

        this.modeIndicator = new Entity(scene, { pos: new Phaser.Math.Vector2(pos.x + MODE_IDICATOR_OFFSET.x, pos.y + MODE_IDICATOR_OFFSET.y), texture: BLUE_MODE }, true);
        this.modeIndicator.setScale(MODE_IDICATOR_SIZE/this.modeIndicator.width);

        this.setModeBlue();

        this.currShootPoints = SHOOTPOINTS_NORMAL;
        this.specials = 3;
        this.castingSpecial = false;
        this.projectileManager = new PoolManager(scene, Player);
        this.projectileManager.addGroup(DATA_PLAYER_P1.texture.key, PlayerShot1, PLAYER_PROJECTILE_POOL);
        this.projectileManager.addGroup(DATA_PLAYER_P2.texture.key, PlayerShot2, PLAYER_PROJECTILE_POOL);
        //this.projectileManager.pList.set(PlayersProjectileType.special, new ProjectileGroup(scene, PlayersProjectileType.special, 2));

        this.shots = [
            function(player: Player) { player.spawnProjectile(player.projectileManager, DATA_PLAYER_P1.texture.key, player.currShootPoints.point_1); },
            function(player: Player) { player.spawnProjectile(player.projectileManager, DATA_PLAYER_P1.texture.key, player.currShootPoints.point_2); },
            function(player: Player) { player.spawnProjectile(player.projectileManager, DATA_PLAYER_P2.texture.key, player.currShootPoints.point_3); },
            function(player: Player) { player.spawnProjectile(player.projectileManager, DATA_PLAYER_P2.texture.key, player.currShootPoints.point_4); },
        ]

        this.shotCounts = 4;

        this.setCollideWorldBounds(true);
    }

    static preload(scene: Phaser.Scene) {
        scene.load.image(PLAYER_TEXTURE.key, PLAYER_TEXTURE.path);

        scene.load.image(HITBOX_TEXTURE.key, HITBOX_TEXTURE.path);
        scene.load.image(BLUE_MODE.key, BLUE_MODE.path);
        scene.load.image(RED_MODE.key, RED_MODE.path);

        scene.load.image(DATA_PLAYER_P1.texture.key, DATA_PLAYER_P1.texture.path);
        scene.load.image(DATA_PLAYER_P2.texture.key, DATA_PLAYER_P2.texture.path);
        scene.load.spritesheet(DATA_PLAYER_PMOON.texture.key, DATA_PLAYER_PMOON.texture.path, { frameWidth: 32, frameHeight: 16 });

        // scene.load.spritesheet(
        //     'cards', 
        //     'assets/sprites/touhou_test/pl_shot.png',
        //     { frameWidth: 16, frameHeight: 32 }
        // );
	}
    
    getDamage(value?: number): void {
        this.scene.tweens.add({
            targets: this,
            duration: 100,
            repeat: 3,
            yoyo: true,
            alpha: 0.5,
            onStart: () => {
                if (value) {
                    this.hp = this.hp - value;
                }
            },
            onComplete: () => {
                this.setAlpha(1);
            },
        });
    }

    create(){
        super.create();

        eventsCenter.on(INPUT_EVENTS.Focus_down, () => {
            this.speed = SPEED_FOCUSED;
            this.currShootPoints = SHOOTPOINTS_FOCUSED;
            this.hitbox.setVisible(true);
		});

        eventsCenter.on(INPUT_EVENTS.Focus_up, () => {
            this.speed = SPEED_NORMAL;
            this.currShootPoints = SHOOTPOINTS_NORMAL;
            this.hitbox.setVisible(false);
		});
    }

    preUpdate(time: number, delta: number){
        // this.hitbox.setPosition(this.x, this.y);
        // this.modeIndicator.setPosition(this.x + MODE_IDICATOR_OFFSET.x, this.y + MODE_IDICATOR_OFFSET.y);
    }

    update(){
        //super.update();
        this.inputHandlingDelegate();
    }

    public handleCollision(entity: Entity) {
        console.dir(entity);
    }

    public handlingInput(value: boolean = true){
        this.inputHandlingDelegate = value ? this.inputHandling : this.emptyFunction;
    }

    protected moveHorizontally(x: number){
        super.moveHorizontally(x);

        // this.hitbox.body.velocity.x = this.body.velocity.x;
        // this.modeIndicator.body.velocity.x = this.body.velocity.x;

        const baseX = this.body.x + this.bodyOffset.x;
        this.hitbox.body.x = baseX + HITBOX_OFFSET;
        this.modeIndicator.body.x = baseX + MODE_IDICATOR_OFFSET.x;
    }

    protected moveVertically(y: number){
        super.moveVertically(y);

        // this.hitbox.body.velocity.y = this.body.velocity.y;
        // this.modeIndicator.body.velocity.y = this.body.velocity.y;

        const baseY = this.body.y + this.bodyOffset.y;
        this.hitbox.body.y = baseY + HITBOX_OFFSET;
        this.modeIndicator.body.y = baseY + MODE_IDICATOR_OFFSET.y;
    }

    private emptyFunction(){ }

    private inputHandling(){
        const {inputs} = InputHandler.Instance();

        // directional movements
        if (inputs.Up) {
            this.moveVertically(-this.speed);
        }
        else if (inputs.Down) {
            this.moveVertically(this.speed);
        }
        else{
            this.moveVertically(0);
        }

        if (inputs.Left) {
            this.moveHorizontally(-this.speed);
        }
        else if (inputs.Right) {
            this.moveHorizontally(this.speed);
        }
        else{
            this.moveHorizontally(0);
        }

        // switch mode
        if(inputs.Switch){
            this.switchMode();
            inputs.Switch = false;
        }

        // actions
        if(!this.castingSpecial){
            if(inputs.Shot && this.time() > this.lastShotTime){
                this.shoot();
            }
            if(inputs.Special && this.specials > 0){
                this.special();
            }
        }
    }

    public setMode(mode: number) {
        super.setMode(mode);
        this.hitbox.setMode(mode);
    }

    private setModeBlue(){
        this.setMode(COLLISION_CATEGORIES.blue);
        this.modeIndicator.setTexture(BLUE_MODE.key);
    }

    private setModeRed(){
        this.setMode(COLLISION_CATEGORIES.red);
        this.modeIndicator.setTexture(RED_MODE.key);
    }

    private switchMode(){
        if(this.collisionCategory == COLLISION_CATEGORIES.blue){
            this.setModeRed();
        }

        else if(this.collisionCategory == COLLISION_CATEGORIES.red){
            this.setModeBlue();
        }
    }

    private shoot(){
        for(let i = 0; i<this.shotCounts; i++){
            this.shots[i](this);
        }

        this.lastShotTime = this.time() + PLAYER_SHOOT_DELAY;
    }

    private special(){
        // const shot = this.projectileManager.pList.get(PlayersProjectileType.special);

        // if(shot){
        //     this.castingSpecial = true;
        //     eventsCenter.emit(PlayerEvents.special);
        //     shot.getProjectile(this.getBody().x, this.getBody().y);
        //     this.specials--; 
        // }
    }
}