/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
// import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DejaTextMetricsModule } from '../../common/core/text-metrics/index';
// import { KeyCodes } from '../../common/core/keycodes.enum';
import { DejaNumericStepperComponent } from './numeric-stepper.component';

describe('DejaNumericStepperComponent', () => {

    let comp: DejaNumericStepperComponent;
    let fixture: ComponentFixture<DejaNumericStepperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                DejaNumericStepperComponent
            ],
            imports: [
                CommonModule,
                DejaTextMetricsModule,
                FormsModule,
                BrowserAnimationsModule,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DejaNumericStepperComponent);
        comp = fixture.componentInstance; // Component test instance
    }));

    it('should create the component', async(() => {
        expect(comp).toBeTruthy();
    }));

    it('should update the value', async(() => {
        comp.value = 10;

        fixture.detectChanges();
        expect(comp.value).toBe(10);
    }));

    it('should set the value to null', async(() => {
        comp.value = null;

        fixture.detectChanges();
        expect(comp.value).toBe(null);
    }));

    it('should not update the value mor than max or less than min', async(() => {
        comp.max = 10;
        comp.min = 5;
        comp.value = 11;

        fixture.detectChanges();
        expect(comp.value).toBe(10);

        comp.value = 4;

        fixture.detectChanges();
        expect(comp.value).toBe(5);
    }));

    it('should not update the value if is disabled', async(() => {
        comp.value = 10;
        comp.disabled = true;

        fixture.detectChanges();
        comp.value = 11;

        fixture.detectChanges();
        expect(comp.value).toBe(10);
    }));
});
