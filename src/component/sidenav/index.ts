/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatIconModule, MatSidenavModule, MatToolbarModule } from '@angular/material';
import { DejaSlimScrollModule } from './../../common/core/slimscroll/index';
import { DejaSidenavContentDirective } from './sidenav-content.directive';
import { DejaSidenavHeaderDirective } from './sidenav-header.directive';
import { DejaSidenavMenuDirective } from './sidenav-menu.directive';
import { DejaSidenavMenuSeparatorDirective } from './sidenav-separator.directive';
import { DejaSidenavComponent } from './sidenav.component';

@NgModule({
    declarations: [
        DejaSidenavComponent,
        DejaSidenavMenuDirective,
        DejaSidenavContentDirective,
        DejaSidenavMenuSeparatorDirective,
        DejaSidenavHeaderDirective,
    ],
    exports: [
        DejaSidenavComponent,
        DejaSidenavMenuDirective,
        DejaSidenavContentDirective,
        DejaSidenavMenuSeparatorDirective,
        DejaSidenavHeaderDirective,
    ],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatSidenavModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        DejaSlimScrollModule,
    ],
})
export class DejaSidenavModule {

}

export * from './sidenav.component';
export * from './sidenav-menu.directive';
export * from './sidenav-content.directive';
export * from './sidenav-separator.directive';
export * from './sidenav-header.directive';
