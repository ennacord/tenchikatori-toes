import Phaser, { Scene } from 'phaser';
import { Dialog, DialogUpdateAction } from '../objects/Dialog';
import { FONT_NOKIA, FONT_INTER, HUD_SIZE, GAMEPLAY_SIZE, SCENE_NAMES } from '../constants';
import { Player, PLAYER_DATA } from '../entities/characters/player/Player';
import { Enemy } from '../entities/characters/enemies/Enemy';
import { Character } from '../entities/characters/Character';
import { DATA_HP_ITEM, DATA_POWER_ITEM, DATA_SCORE_ITEM, DATA_SPECIAL_ITEM } from '../entities/projectiles/items/Item';
import { Entity } from '../entities/Entity';
import { eventsCenter, GAMEPLAY_EVENTS } from '../plugins/EventsCentre';
import { addText, IText } from '../@types/UI';
import { PoolManager } from '../@types/Pool';
import { InputHandler } from '../plugins/InputHandler';

export abstract class GameplayScene extends Scene {
	dialog?: IDialog;
	player?: Player;
	mobManager?: PoolManager;
	bgm?: Phaser.Sound.BaseSound;
	background?: unknown;

	constructor(name: string) {
		super(name);
	}

	preload() {
		Player.preload(this);
		Enemy.preload(this);
	}

	create() {
		this.input.on('pointerdown', () => {
			this.dialog?.update(this, { dialogUpdate: DialogUpdateAction.PROGRESS });
		});

		this.mobManager = new PoolManager(this);
		this.player = new Player(this);

		Enemy.initPManagers(this);
		Character.initManager(this);
		Entity.setWorldsEdge(this);

		this.cameras.main.setViewport(GAMEPLAY_SIZE.OFFSET, GAMEPLAY_SIZE.OFFSET, GAMEPLAY_SIZE.WIDTH, GAMEPLAY_SIZE.HEIGHT);
		this.physics.world.setBounds(0, 0, GAMEPLAY_SIZE.WIDTH, GAMEPLAY_SIZE.HEIGHT);

		this.events.on(Phaser.Scenes.Events.CREATE, () => { this.scene.run(SCENE_NAMES.HUD); eventsCenter.emit(GAMEPLAY_EVENTS.gameplayStart, this) }, this);
		// this.events.on(Phaser.Scenes.Events.SLEEP, () => { this.scene.sleep(SCENE_NAMES.HUD); eventsCenter.emit(GAMEPLAY_EVENTS.gameplayPause, this) }, this);
		// this.events.on(Phaser.Scenes.Events.WAKE, () => this.scene.wake(SCENE_NAMES.HUD), this);
		this.events.on(Phaser.Scenes.Events.PAUSE, () => { this.scene.pause(SCENE_NAMES.HUD); InputHandler.Instance().reset(); eventsCenter.emit(GAMEPLAY_EVENTS.gameplayPause, this); }, this);
		this.events.on(Phaser.Scenes.Events.RESUME, () => this.scene.resume(SCENE_NAMES.HUD), this);
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => { this.scene.sleep(SCENE_NAMES.HUD); InputHandler.Instance().reset(); }, this);

		// eventsCenter.on(GAMEPLAY_EVENTS.gameplayStart, () => this.scene.run(SCENE_NAMES.HUD), this);
		// eventsCenter.on(GAMEPLAY_EVENTS.gameplayPause,  () => this.scene.pause(SCENE_NAMES.HUD), this);
		// eventsCenter.on(GAMEPLAY_EVENTS.gameplayResume, () => this.scene.resume(SCENE_NAMES.HUD), this);
	}

	update() {
		this.dialog?.update(this, {});
		this.player?.update();

		const {inputs} = InputHandler.Instance();

		if(inputs.Pause){
			// this.scene.switch(SCENE_NAMES.PauseMenu);
			this.scene.pause();
			this.scene.launch(SCENE_NAMES.PauseMenu);
			eventsCenter.emit(GAMEPLAY_EVENTS.gameplayPause, SCENE_NAMES.Stage1_Gameplay);
		}
	}
}

const HUD_LINE_SPACING = HUD_SIZE.height*.1;
const HUD_LINE_BASE = new Phaser.Math.Vector2(10, 10);
const HUD_VALUE_OFFSET_X = HUD_SIZE.width*.5;
const HUD_ICON_OFFSET = new Phaser.Math.Vector2(HUD_SIZE.width*.1, HUD_SIZE.height*.012);
const HUD_TEXT_SIZE = 25;
const HUD_FRONT = FONT_NOKIA.key;
const HUD_TEXT_TINT = 0xFFFFFF;

const HUD_HISCORE: IText = {
	text: 'High Score',
	font: HUD_FRONT,
	textSize: HUD_TEXT_SIZE,
	textTint: HUD_TEXT_TINT,
	point: { pos: new Phaser.Math.Vector2(HUD_LINE_BASE.x + HUD_LINE_SPACING, HUD_LINE_BASE.y + HUD_LINE_SPACING) },
}

const HUD_SCORE: IText = {
	text: 'Score',
	font: HUD_FRONT,
	textSize: HUD_TEXT_SIZE,
	textTint: HUD_TEXT_TINT,
	point: { pos: new Phaser.Math.Vector2(HUD_LINE_BASE.x + HUD_LINE_SPACING, HUD_LINE_BASE.y + HUD_LINE_SPACING*2) },
}

const HUD_LIVES_COUNT: IText = {
	text: 'HP',
	font: HUD_FRONT,
	textSize: HUD_TEXT_SIZE,
	textTint: HUD_TEXT_TINT,
	point: { pos: new Phaser.Math.Vector2(HUD_LINE_BASE.x + HUD_LINE_SPACING, HUD_LINE_BASE.y + HUD_LINE_SPACING*3) },
}

const HUD_SPECIAL_COUNT: IText = {
	text: 'Special',
	font: HUD_FRONT,
	textSize: HUD_TEXT_SIZE,
	textTint: HUD_TEXT_TINT,
	point: { pos: new Phaser.Math.Vector2(HUD_LINE_BASE.x + HUD_LINE_SPACING, HUD_LINE_BASE.y + HUD_LINE_SPACING*4) },
}

const HUD_POWER: IText = {
	text: 'Power',
	font: HUD_FRONT,
	textSize: HUD_TEXT_SIZE,
	textTint: HUD_TEXT_TINT,
	point: { pos: new Phaser.Math.Vector2(HUD_LINE_BASE.x + HUD_LINE_SPACING, HUD_LINE_BASE.y + HUD_LINE_SPACING*5) },
}

const HUD_EXTRA_SCORE: IText = {
	text: 'Extra Score',
	font: HUD_FRONT,
	textSize: HUD_TEXT_SIZE,
	textTint: HUD_TEXT_TINT,
	point: { pos: new Phaser.Math.Vector2(HUD_LINE_BASE.x + HUD_LINE_SPACING, HUD_LINE_BASE.y + HUD_LINE_SPACING*6) },
}

const HUD_GRAZE_COUNT: IText = {
	text: 'Graze Count',
	font: HUD_FRONT,
	textSize: HUD_TEXT_SIZE,
	textTint: HUD_TEXT_TINT,
	point: { pos: new Phaser.Math.Vector2(HUD_LINE_BASE.x + HUD_LINE_SPACING, HUD_LINE_BASE.y + HUD_LINE_SPACING*7) },
}

export class HUDScene extends Scene{
	hiscoreValue?: Phaser.GameObjects.BitmapText;
	scoreValue?: Phaser.GameObjects.BitmapText;
	HPCount?: Phaser.GameObjects.BitmapText;
	specialCountValue?: Phaser.GameObjects.BitmapText;
	powerCount?: Phaser.GameObjects.BitmapText;
	extraScoreValue?: Phaser.GameObjects.BitmapText;
	grazeCount?: Phaser.GameObjects.BitmapText;

	constructor() {
		super(SCENE_NAMES.HUD);
	}

	async create() {
		this.cameras.main.setViewport(HUD_SIZE.offset.x, HUD_SIZE.offset.y, HUD_SIZE.width, HUD_SIZE.height);

		this.scoreValue = this.displayText(HUD_SCORE);
		this.grazeCount = this.displayText(HUD_GRAZE_COUNT);
		this.HPCount = this.displayTextItem(HUD_LIVES_COUNT, DATA_HP_ITEM.texture.key);
		this.specialCountValue = this.displayTextItem(HUD_SPECIAL_COUNT, DATA_SPECIAL_ITEM.texture.key);
		this.powerCount = this.displayTextItem(HUD_POWER, DATA_POWER_ITEM.texture.key);
		this.extraScoreValue = this.displayTextItem(HUD_EXTRA_SCORE, DATA_SCORE_ITEM.texture.key);

		eventsCenter.on(GAMEPLAY_EVENTS.displayScore, (value: string) => this.updateText(this.scoreValue!, value), this);
		eventsCenter.on(GAMEPLAY_EVENTS.displayExtraScore, (value: string) => this.updateText(this.extraScoreValue!, value), this);
		eventsCenter.on(GAMEPLAY_EVENTS.displayGrazeCount, (value: string) => this.updateText(this.grazeCount!, value), this);
		eventsCenter.on(GAMEPLAY_EVENTS.displayHPCount, (value: string) => this.updateTextMax(this.HPCount!, value, PLAYER_DATA.maxHP.toString()), this);
		eventsCenter.on(GAMEPLAY_EVENTS.displayPowerCount, (value: string) => this.updateTextMax(this.powerCount!, value, PLAYER_DATA.maxPower.toString()), this);
		eventsCenter.on(GAMEPLAY_EVENTS.displaySpecialCount, (value: string) => this.updateTextMax(this.specialCountValue!, value, PLAYER_DATA.maxSpecial.toString()), this);

		this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.shutdown);
	}

	protected displayText(textData: IText){
		addText(this, textData);
		return addText(this, { text: '', font: textData.font, textSize: textData.textSize, textTint: textData.textTint, point: { pos: new Phaser.Math.Vector2(textData.point.pos.x + HUD_VALUE_OFFSET_X, textData.point.pos.y) } });
	}

	protected displayTextItem(textData: IText, icon: string){
		this.add.image(textData.point.pos.x-HUD_ICON_OFFSET.x, textData.point.pos.y+HUD_ICON_OFFSET.y, icon);
		return this.displayText(textData);
	}

	protected updateText(text: Phaser.GameObjects.BitmapText, value: string){
		text.setText(value);
	}

	protected updateTextMax(text: Phaser.GameObjects.BitmapText, value: string, maxValue: string){
		text.setText(value + '/' + maxValue);
	}

	private shutdown(){
		// this.scoreValue?.destroy();
		// this.grazeCount?.destroy();
		// this.HPCount?.destroy();
		// this.specialCountValue?.destroy();
		// this.powerCount?.destroy();
		// this.extraScoreValue?.destroy();
	}
}