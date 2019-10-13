interface IShapeTemplate {
    type: string;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    r?: number;
}

declare class Copy extends PIXI.AnimatedSprite {
    constructor(type: string, x: number, y: number, exts: object);

    type: string;
    tex: string;
    shape: IShapeTemplate;
    uid: number;

    xprev: number;
    yprev: number;
    speed: number;
    hspeed: number;
    vspeed: number;
    gravity: number;
    gravityDir: number;
    direction: number;

    depth: number;
    rotation: number;

    move(): void;
    addSpeed(spd: number, dir: number): void
}