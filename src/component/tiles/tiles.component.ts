/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter, Input, OnDestroy, Optional, Output, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeWhile';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Rect } from '../../common/core/graphics/rect';
import { KeyCodes } from '../../common/core/keycodes.enum';
import { IDropCursorInfos } from '../mouse-dragdrop/mouse-dragdrop.service';
import { IDejaMouseDroppableContext } from '../mouse-dragdrop/mouse-droppable.directive';
import { DejaTileGroupComponent } from './tile-group.component';
import { DejaTile } from './tile.class';
import { IDejaTile } from './tile.interface';
import { DejaTilesLayoutProvider, IDejaTilesRefreshParams } from './tiles-layout.provider';
import { IDejaTilesAddEvent, IDejaTilesEvent, IDejaTilesModelEvent, IDejaTilesRemoveEvent } from './tiles.event';

const noop = () => { };

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DejaTilesLayoutProvider],
    selector: 'deja-tiles',
    styleUrls: [
        './tiles.component.scss',
    ],
    templateUrl: './tiles.component.html',
})
export class DejaTilesComponent implements AfterViewInit, ControlValueAccessor, OnDestroy {
    /**
     * Raised when the selected items has changed
     */
    @Output() public selectionChanged = new EventEmitter<IDejaTilesEvent>();

    /**
     * Raised when the layout has changed with a drag and drop
     */
    @Output() public layoutChanged = new EventEmitter<IDejaTilesEvent>();

    /**
     * Raised when the layout is completed and all tiles are binded
     */
    @Output() public layoutCompleted = new EventEmitter<IDejaTilesEvent>();

    /**
     * Raised before some tiles will be added to the data model with a paste
     */
    @Output() public contentAdding = new EventEmitter<IDejaTilesAddEvent>();

    /**
     * Raised before some tiles will be removed from the data model with a delete
     */
    @Output() public contentRemoving = new EventEmitter<IDejaTilesRemoveEvent>();

    /**
     * Raised when some tiles model has changed
     */
    @Output() public modelChanged = new EventEmitter<IDejaTilesModelEvent>();

    /**
     * Raised when some tiles are copied in the clipboard service. Can result from a copy or paste operation on the tiles.
     */
    @Output() public contentCopied = new EventEmitter<IDejaTilesEvent>();

    /**
     * Tab index of the focusable element
     */
    @Input() public tabIndex = 0;

    @ContentChild('tileTemplate') protected tileTemplate;

    // NgModel implementation
    protected onTouchedCallback: () => void = noop;
    protected onChangeCallback: (_: any) => void = noop;

    private _models = [] as IDejaTile[];
    private delete$sub: Subscription;
    private copy$sub: Subscription;
    private cut$sub: Subscription;
    private paste$sub: Subscription;
    private keyup$: Observable<KeyboardEvent>;
    private isAlive = true;
    private _tiles$ = new BehaviorSubject<DejaTile[]>([]);
    private hasFocus = false;

    public get tiles$(): BehaviorSubject<DejaTile[]> {
        return this._tiles$;
    }

    @ViewChild('tilesContainer') private tilesContainer: ElementRef;

    constructor(el: ElementRef, private changeDetectorRef: ChangeDetectorRef, private layoutProvider: DejaTilesLayoutProvider, @Self() @Optional() public _control: NgControl) {
        if (this._control) {
            this._control.valueAccessor = this;
        }

        const element = el.nativeElement as HTMLElement;

        Observable.from(this.layoutProvider.selectionChanged)
            .takeWhile(() => this.isAlive)
            .subscribe((e) => this.selectionChanged.emit(e));

        Observable.from(this.layoutProvider.contentAdding)
            .takeWhile(() => this.isAlive)
            .subscribe((e) => this.contentAdding.emit(e));

        Observable.from(this.layoutProvider.contentRemoving)
            .takeWhile(() => this.isAlive)
            .subscribe((e) => this.contentRemoving.emit(e));

        Observable.from(this.layoutProvider.modelChanged)
            .takeWhile(() => this.isAlive)
            .subscribe((event) => {
                this.modelChanged.emit(event);
                this.onChangeCallback(event.tiles);
            });

        Observable.from(this.layoutProvider.layoutChanged)
            .takeWhile(() => this.isAlive)
            .subscribe((event) => {
                this.layoutChanged.emit(event);
                this.onChangeCallback(event.tiles);
            });

        Observable.from(this.layoutProvider.layoutCompleted)
            .takeWhile(() => this.isAlive)
            .subscribe((event) => this.layoutCompleted.emit(event));

        this.keyup$ = Observable.fromEvent(element.ownerDocument, 'keyup');

        Observable.fromEvent(window, 'resize')
            .takeWhile(() => this.isAlive)
            .debounceTime(5)
            .subscribe(() => this.refresh({ resetWidth: true }));

        Observable.from(this._tiles$)
            .subscribe((tiles) => this.layoutProvider.tiles = tiles);
    }

    // provide a public acccess
    public get selectionRect$(): Subject<Rect> {
        return this.layoutProvider.selectionRect$;
    }

    @Input()
    public set tileminwidth(value: string) {
        this.layoutProvider.tileminwidth = value;
    }

    @Input()
    public set tilemaxwidth(value: string) {
        this.layoutProvider.tilemaxwidth = value;
    }

    @Input()
    public set tileminheight(value: string) {
        this.layoutProvider.tileminheight = value;
    }

    @Input()
    public set tilemaxheight(value: string) {
        this.layoutProvider.tilemaxheight = value;
    }

    @Input()
    public set maxwidth(value: string) {
        this.layoutProvider.maxwidth = value;
    }

    @Input()
    public set designMode(value: boolean | string) {
        this.layoutProvider.designMode = coerceBooleanProperty(value);
    }

    public get designMode() {
        return this.layoutProvider.designMode;
    }

    @Input()
    public set models(models: IDejaTile[]) {
        this.writeValue(models);
    }

    @Input()
    public set canDelete(value: boolean) {
        if (coerceBooleanProperty(value) && !this.delete$sub) {
            this.delete$sub = this.keyup$
                .filter(() => this.layoutProvider.designMode)
                .filter((event: KeyboardEvent) => {
                    const keyCode = event.keyCode || KeyCodes[event.code];
                    return keyCode === KeyCodes.Delete && this.hasFocus;
                })
                .subscribe(() => this.layoutProvider.deleteSelection());

        } else if (this.delete$sub) {
            this.delete$sub.unsubscribe();
            this.delete$sub = undefined;
        }
    }

    @Input()
    public set canCopy(value: boolean) {
        if (coerceBooleanProperty(value) && !this.copy$sub) {
            this.copy$sub = this.keyup$
                .filter((event: KeyboardEvent) => {
                    const keyCode = event.keyCode || KeyCodes[event.code];
                    return keyCode === KeyCodes.KeyC && event.ctrlKey && this.hasFocus;
                })
                .subscribe(() => {
                    this.copySelection();
                });

        } else if (this.copy$sub) {
            this.copy$sub.unsubscribe();
            this.copy$sub = undefined;
        }
    }

    @Input()
    public set canCut(value: boolean) {
        if (coerceBooleanProperty(value) && !this.cut$sub) {
            this.cut$sub = this.keyup$
                .filter(() => this.layoutProvider.designMode)
                .filter((event: KeyboardEvent) => {
                    const keyCode = event.keyCode || KeyCodes[event.code];
                    return keyCode === KeyCodes.KeyX && event.ctrlKey && this.hasFocus;
                })
                .subscribe(() => {
                    this.cutSelection();
                });

        } else if (this.cut$sub) {
            this.cut$sub.unsubscribe();
            this.cut$sub = undefined;
        }
    }

    @Input()
    public set canPaste(value: boolean) {
        if (coerceBooleanProperty(value) && !this.paste$sub) {
            this.paste$sub = this.keyup$
                .filter(() => this.layoutProvider.designMode)
                .filter((event: KeyboardEvent) => {
                    const keyCode = event.keyCode || KeyCodes[event.code];
                    return keyCode === KeyCodes.KeyV && event.ctrlKey && this.hasFocus;
                })
                .subscribe(() => this.paste());

        } else if (this.paste$sub) {
            this.paste$sub.unsubscribe();
            this.paste$sub = undefined;
        }
    }

    @Input()
    public set selectedTiles(selectedIds: string[]) {
        this.layoutProvider.selectedTiles = selectedIds;
    }

    // ************* ControlValueAccessor Implementation **************
    public writeValue(models: any) {
        this._models = models || [];
        const tiles = this._models.map((tile) => new DejaTile(tile));
        this._tiles$.next(tiles);
        this.changeDetectorRef.markForCheck();
    }

    public registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    public registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }
    // ************* End of ControlValueAccessor Implementation **************

    public ngAfterViewInit() {
        this.layoutProvider.container = this.tilesContainer.nativeElement;
        this.refresh({ resetWidth: true });
    }

    public ngOnDestroy() {
        this.layoutProvider.ngOnDestroy();
        this.canCopy = false;
        this.canCut = false;
        this.canDelete = false;
        this.canPaste = false;
        this.isAlive = false;
    }

    public copySelection() {
        const tiles = this.layoutProvider.copySelection();
        if (tiles && tiles.length) {
            const event = new CustomEvent('DejaTilesCopied', { cancelable: true }) as IDejaTilesEvent;
            event.tiles = tiles.map((tile) => tile.toTileModel());
            this.contentCopied.emit(event);
        }
    }

    public cutSelection() {
        const tiles = this.layoutProvider.cutSelection();
        if (tiles && tiles.length) {
            const event = new CustomEvent('DejaTilesCutted', { cancelable: true }) as IDejaTilesEvent;
            event.tiles = tiles.map((tile) => tile.toTileModel());
            this.contentCopied.emit(event);
        }
    }

    public deleteSelection() {
        const tiles = this.layoutProvider.deleteSelection();
        this.changeDetectorRef.markForCheck();
        return tiles;
    }

    public paste() {
        const tiles = this.layoutProvider.paste();
        this.changeDetectorRef.markForCheck();
        return tiles;
    }

    public ensureVisible(id: string) {
        this.layoutProvider.ensureVisible$.next(id);
    }

    public expandTile(tile: IDejaTile, pixelheight: number) {
        this.layoutProvider.expandTile(tile, pixelheight);
    }

    public cancelExpand() {
        this.layoutProvider.cancelExpand();
    }

    public refresh(params?: IDejaTilesRefreshParams) {
        this.layoutProvider.refreshTiles$.next(params);
    }

    public addTiles(tiles: IDejaTile[]) {
        this.layoutProvider.addTiles(tiles.map((tile) => new DejaTile(tile)));
    }

    public removeTiles(tileIds: string[]) {
        this.layoutProvider.removeTiles(tileIds);
    }

    public addGroup(title?: string, bounds?: Rect) {
        const tile = {
            type: 'group',
            bounds: bounds || this.getFreePlace(0, 0, 15, 5),
            color: DejaTileGroupComponent.defaultColor,
            templateModel: {
                title: title || 'New Group',
            },
        } as IDejaTile;

        this.layoutProvider.createTiles([tile]);

        return tile;
    }

    public getFreePlace(pageX?: number, pageY?: number, width?: number, height?: number) {
        if (!this._models || this._models.length === 0) {
            return new Rect(0, 0, width, height);
        }

        // Check if we drag on a tile
        const containerElement = this.tilesContainer.nativeElement as HTMLElement;
        const containerBounds = containerElement.getBoundingClientRect();

        const x = pageX ? (pageX - containerBounds.left) : 0;
        const y = pageY ? (pageY - containerBounds.top) : 0;

        const percentBounds = new Rect(this.layoutProvider.getPercentSize(x), this.layoutProvider.getPercentSize(y), width, height);
        return this.layoutProvider.getFreePlace(percentBounds);
    }

    public moveTile(id: string, bounds: Rect) {
        this.layoutProvider.moveTile(id, bounds);
    }

    public getDropContext() {
        return {
            dragEnter: (dragContext, dragCursor) => {
                return this.layoutProvider.dragEnter(dragContext, dragCursor) && {
                    className: 'hidden', // Hide drag cusror
                } as IDropCursorInfos;
            },
            dragOver: (_dragContext, dragCursor) => {
                this.layoutProvider.dragover$.next(dragCursor);
            },
            dragLeave: (_dragContext, _dragCursor) => {
                this.layoutProvider.dragleave$.next();
            },
        } as IDejaMouseDroppableContext;
    }

    public onTileClosed(tile: DejaTile) {
        this.layoutProvider.removeTiles([tile.id]);
    }

    public onTileModelChanged() {
        const event = new CustomEvent('DejaTilesModelEvent', { cancelable: false }) as IDejaTilesModelEvent;
        event.tiles = this.layoutProvider.tiles.map((t) => t.toTileModel());
        this.modelChanged.emit(event);
    }

    public onFocus() {
        this.hasFocus = true;
    }

    public onBlur() {
        this.hasFocus = false;
    }
}
