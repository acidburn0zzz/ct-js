interface ITileTemplate {
    x: number;
    y: number;
}

interface ITileLayerTemplate {
    depth: number;
    tiles: Array<ITileTemplate>
}

interface IRoomTemplate {
    name: string;
    width: number;
    height: number;
    objects: ICopyTemplate;
    bgs: Array<IBackgroundTemplate>;
    tiles: Array<ITileLayerTemplate>;
    onStep(): void;
    onDraw(): void;
    onLeave(): void;
    onCreate(): void;
}

declare class Room extends PIXI.Container {
    constructor(template: IRoomTemplate);

    follow: Copy|null;
    borderX: number;
    borderY: number;
    followShiftX: number;
    followShiftY: number;
    followDrift: number;

    tileLayers: Array<PIXI.TileLayer>
    backgrounds: Array<Background>

    onCreate(): void;
    onStep(): void;
    onDraw(): void;
    onLeave(): void;

    template: IRoomTemplate;
    name: string;

    [key: string]: any
}