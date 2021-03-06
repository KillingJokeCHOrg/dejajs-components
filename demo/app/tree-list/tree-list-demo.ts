/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { ChangeDetectorRef, Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { GroupingService } from '../../../src/common/core/grouping/grouping.service';
import { IItemBase } from '../../../src/common/core/item-list/item-base';
import { IItemTree } from '../../../src/common/core/item-list/item-tree';
import { IViewPortItem } from '../../../src/common/core/item-list/viewport.service';
import { IDejaDragEvent } from '../../../src/component/dragdrop/draggable.directive';
import { IDropCursorInfos } from '../../../src/component/mouse-dragdrop/mouse-dragdrop.service';
import { IDejaMouseDraggableContext } from '../../../src/component/mouse-dragdrop/mouse-draggable.directive';
import { IDejaMouseDroppableContext } from '../../../src/component/mouse-dragdrop/mouse-droppable.directive';
import { DejaTreeListComponent } from '../../../src/component/tree-list/tree-list.component';
import { News } from '../common/news.model';
import { CountriesListService } from '../services/countries-list.service';
import { CountriesService, Country } from '../services/countries.service';
import { Folder, FoldersService } from '../services/folders.service';
import { NewsService } from '../services/news.service';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'deja-tree-list-demo',
    styleUrls: ['./tree-list-demo.scss'],
    templateUrl: './tree-list-demo.html',
})
export class DejaTreeListDemoComponent implements OnDestroy {
    public fruct = 'apricots';
    public fructs = [] as string[];
    public fructItems = [] as IItemBase[];
    public fructItemsWithPreSelection = [] as IItemBase[];
    public folders: Folder[];

    protected disabled: boolean;
    protected country: Country;
    protected deepCountry = {
        l1: {
            l2: {
                name: 'Switzerland',
                value: 'CH',
            }
        }
    };
    public tabIndex = 1;
    protected news$: Observable<News[]>;
    protected bigNews$: Observable<News[]>;
    protected bigCountries$: Observable<Country[]>;
    protected viewPortInfos: {
        name: string;
        value: string;
    }[];
    protected viewPortInfos$: Subscription;
    protected dialogResponse$: Subject<string> = new Subject<string>();
    protected loremList: IItemTree[] = [];

    private countries: Observable<Country[]>;
    public deepCountries: Observable<any>;
    private countriesForMultiselect: Country[];
    private groupedCountries: ICountryGroup[];
    public onDemandGroupedCountries: ICountryGroup[];
    public multiselectModel: IItemTree[];
    private _dialogVisible = false;
    private subscriptions = [] as Subscription[];

    @ViewChild('news') private newsList: DejaTreeListComponent;
    @ViewChild('onexpand') private onExpandList: DejaTreeListComponent;

    public set dialogVisible(value: boolean) {
        this._dialogVisible = value;
        this.changeDetectorRef.markForCheck();
    }

    public get dialogVisible() {
        return this._dialogVisible;
    }

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private countriesService: CountriesService,
        private folderService: FoldersService,
        protected countriesListService: CountriesListService,
        public newsService: NewsService,
        public groupingService: GroupingService
    ) {
        this.multiselectModel = JSON.parse('[{"naqme":"ÅlandIslands","code":"AX","displayName":"ÅlandIslands","depth":0,"odd":true,"selected":true},{"naqme":"AmericanSamoa","code":"AS","displayName":"AmericanSamoa","depth":0,"odd":false,"selected":true},{"naqme":"Argentina","code":"AR","displayName":"Argentina","depth":0,"odd":false,"selected":true},{"naqme":"ChristmasIsland","code":"CX","displayName":"ChristmasIsland","depth":0,"odd":false,"selected":true},{"naqme":"Egypt","code":"EG","displayName":"Egypt","depth":0,"odd":true,"selected":true},{"naqme":"Dominica","code":"DM","displayName":"Dominica","depth":0,"odd":false,"selected":true}]');
        this.news$ = newsService.getNews$(50);
        this.bigNews$ = newsService.getNews$(10000);
        this.bigCountries$ = countriesService.getCountries$(null, 100000);

        for (let i = 0; i < 50; i++) {
            const rand = Math.floor(Math.random() * (70 - 33 + 1)) + 33; // random de 33 à 70
            this.loremList[i] = {} as IItemTree;
            this.loremList[i].size = rand;
            this.loremList[i].displayName = `${i} - Une ligne de test avec une taille de : ${rand}`;
        }

        groupingService.group(this.loremList, [{ groupByField: 'height' }]).then((groupedResult) => {
            this.loremList = groupedResult;
        });

        this.country = new Country();
        this.country.code = 'CH';
        this.country.displayName = 'Switzerland';
        this.country.naqme = 'Switzerland';
        this.country.color = 'rgb(211, 47, 47)';

        this.countries = this.countriesService.getCountries$();

        this.folders = this.folderService.getFolders();

        this.deepCountries = this.countriesService.getCountries$()
            .switchMap((countries) => countries)
            .map((country) => ({
                l1: {
                    l2: {
                        name: country.naqme,
                        value: country.code,
                    }
                }
            }))
            .reduce((acc: any[], cur) => {
                acc.push(cur);
                return acc;
            }, []);

        this.fructs = [
            'Apricots',
            'Banana',
            'Cantaloupe',
            'Cherries',
            'Coconut',
            'Cranberries',
            'Durian',
            'Grapes',
            'Lemon',
            'Mango',
            'Pineapple',
            'Watermelon',
        ];

        this.fructItems = this.fructs.map((fruct) => ({
            displayName: fruct,
            value: fruct.toLowerCase(),
        } as IItemBase));

        this.fructItemsWithPreSelection = this.fructs.map((fruct, index) => ({
            displayName: fruct,
            value: fruct.toLowerCase(),
            selected: index === 1,
        } as IItemBase));

        this.subscriptions.push(this.countries
            .do((value) => this.countriesForMultiselect = value)
            .delay(1)
            .subscribe(() => {
                this.multiselectModel = JSON.parse('[{"naqme":"ÅlandIslands","code":"AX","displayName":"ÅlandIslands","depth":0,"odd":true,"selected":true},{"naqme":"AmericanSamoa","code":"AS","displayName":"AmericanSamoa","depth":0,"odd":false,"selected":true},{"naqme":"Argentina","code":"AR","displayName":"Argentina","depth":0,"odd":false,"selected":true},{"naqme":"ChristmasIsland","code":"CX","displayName":"ChristmasIsland","depth":0,"odd":false,"selected":true},{"naqme":"Egypt","code":"EG","displayName":"Egypt","depth":0,"odd":true,"selected":true},{"naqme":"Dominica","code":"DM","displayName":"Dominica","depth":0,"odd":false,"selected":true}]');
            }));

        this.subscriptions.push(this.countries.subscribe((value: Country[]) => {
            const result = [] as ICountryGroup[];
            const onDemandResult = [] as ICountryGroup[];
            const map = {} as { [groupName: string]: ISelectCountry[] };

            result.push({
                collapsible: true,
                collapsed: true,
                groupName: 'EmptyGroup',
                items: [],
                displayName: 'Empty Group',
                selectable: false,
            } as ICountryGroup);

            value.map((country) => {
                const groupName = `Group ${country.naqme[0]}`;
                if (!map[groupName]) {
                    map[groupName] = [] as ICountryGroup[];
                    result.push({
                        collapsible: true,
                        groupName: groupName,
                        items: map[groupName],
                        displayName: groupName,
                        selectable: false,
                    } as ICountryGroup);

                    onDemandResult.push({
                        collapsible: true,
                        collapsed: true,
                        groupName: groupName,
                        items: [{
                            displayName: 'loading...',
                            selectable: false,
                        }],
                        displayName: groupName,
                        selectable: false,
                        loaded: false,
                    } as ICountryGroup);
                }

                map[groupName].push({ model: country });
            });

            this.groupedCountries = result;
            this.onDemandGroupedCountries = onDemandResult;
        }));
    }

    public ngOnDestroy() {
        this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    }

    protected loadingItems() {
        const self = this;
        return (_query: string | RegExp, _selectedItems: IItemBase[]) => self.countriesService.getCountries$().delay(3000);
    }

    protected collapsingItems() {
        const self = this;
        return (item: IItemBase) => {
            const country = item as ICountryGroup;
            return country.loaded ? Observable.of(item) : self.confirmDialog()(item);
        };
    }

    protected expandingItems() {
        const self = this;
        return (item: IItemBase) => {
            const group = item as ICountryGroup;
            if (group.loaded) {
                return Observable.of(item);
            } else {
                return self.confirmDialog()(item)
                    .switchMap((itm) => {
                        if (!itm) {
                            return Observable.of(null);
                        }

                        Observable.of(group)
                            .delay(2000)
                            .first()
                            .subscribe((grp) => {
                                // Simulate asynchronous load
                                const original = this.groupedCountries.find((c) => c.displayName === grp.displayName);
                                grp.items = original.items;
                                grp.loaded = true;
                                this.onExpandList.refresh();
                            });

                        return Observable.of(itm);
                    });
            }
        };
    }

    protected confirmDialog() {
        const self = this;
        return (item: IItemBase) => {
            self.dialogVisible = true;
            return Observable.from(this.dialogResponse$)
                .first()
                .map((response) => {
                    self.dialogVisible = false;
                    return response === 'ok' ? item : null;
                });
        };
    }

    @ViewChild('bigCountries')
    protected set bigCountriesList(treelist: DejaTreeListComponent) {
        if (this.viewPortInfos$) {
            this.viewPortInfos$.unsubscribe();
            this.viewPortInfos = [];
            delete this.viewPortInfos$;
        }

        this.viewPortInfos$ = treelist && treelist.viewPort.viewPort$.subscribe((viewPort) => {
            this.viewPortInfos = [
                { name: 'beforeSize', value: String(viewPort.beforeSize), },
                { name: 'startIndex', value: String(viewPort.startIndex), },
                { name: 'viewPortSize', value: String(viewPort.viewPortSize), },
                { name: 'visibleCount', value: String(viewPort.visibleItems && viewPort.visibleItems.length), },
                { name: 'endIndex', value: String(viewPort.endIndex), },
                { name: 'afterSize', value: String(viewPort.afterSize), },
                { name: 'itemsCount', value: String(viewPort.items && viewPort.items.length), }
            ];
        });
    }

    protected imageLoaded(item: IViewPortItem) {
        const itemExt = item as IExtendedViewPortItem;
        if (!itemExt.loaded) {
            itemExt.loaded = true;
            this.newsList.refreshViewPort(itemExt);
        }
    }

    protected multiselectModelChange(countries: Country[]) {
        this.multiselectModel = countries ? countries : null;
    }

    protected onFilterTemplateClicked(where: string) {
        alert(`${where} clicked`);
    }

    protected onItemDragStart(event: IDejaDragEvent) {
        event.dragInfo.country = event.dragObject;
    }

    protected onDivDragOver(event: IDejaDragEvent) {
        if (event.dragInfo.hasOwnProperty('country')) {
            event.preventDefault();
        }
    }

    protected onDivDropEvent(event: IDejaDragEvent) {
        if (event.dragInfo.hasOwnProperty('country')) {
            const country = event.dragInfo.country as Country;
            (event.target as HTMLElement).innerText = `The dropped country is ${country.naqme} - the code is: ${country.code}`;
            event.preventDefault();
        }
    }

    protected getDragContext() {
        return {
            target: '[ddid]',
            className: 'item-base-cursor',
            dragStart: (target: HTMLElement) => {
                const id = target && target.getAttribute('ddid');
                return id && this.countriesService.getCountryByCode$(id);
            },
        } as IDejaMouseDraggableContext;
    }

    protected getDropContext(dropArea: HTMLElement) {
        return {
            dragEnter: (_dragContext) => {
                return {
                    width: 200,
                    height: 60,
                    className: 'country-target-cursor',
                } as IDropCursorInfos;
            },
            drop: (dragContext) => {
                const country = dragContext as Country;
                dropArea.innerText = `The dropped country is ${country.naqme} - the code is: ${country.code}`;
            },
        } as IDejaMouseDroppableContext;
    }
}

interface ISelectCountry extends IItemTree {
    items?: IItemTree[];
}

interface ICountryGroup extends ISelectCountry {
    groupName?: string;
    items: IItemBase[];
    loaded?: boolean;
}

export interface IExtendedViewPortItem extends IViewPortItem {
    loaded: boolean;
}
