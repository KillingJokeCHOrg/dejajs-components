/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'dejadate-picker-demo',
    templateUrl: './date-picker-demo.html',
})
export class DejaDatePickerDemoComponent implements OnInit {
    protected tabIndex = 1;

    public theDate: Date = new Date();
    public theDateSelected: Date = new Date();

    public disabledDate = [0, 6, new Date(2016, 9, 12)];

    public dateRangeFrom: Date;
    public dateRangeTo: Date;
    public dateMin: Date;
    public dateMax: Date;

    constructor() {
    }

    public ngOnInit() {
        const now: Date = new Date();
        this.dateMin = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        this.dateMax = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        this.theDateSelected = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        console.log(this.dateMin);
        console.log(this.dateMax);
    }
}