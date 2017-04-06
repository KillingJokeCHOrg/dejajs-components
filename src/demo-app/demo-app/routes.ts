/*
 * *
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 * /
 *
 */

import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DejaAccordionDemoComponent } from '../accordion/accordion-demo';
import { DejaCircularPickerDemoComponent } from '../circular-picker/circular-picker-demo';
import { DejaColorSelectorDemoComponent } from '../color-selector/color-selector-demo';
import { DejaContentEditableDemoComponent } from '../content-editable/content-editable-demo';
import { DejaDatePickerDemoComponent } from '../date-picker/date-picker-demo';
import { GlobalEventsDemoComponent } from '../global-events/global-events-demo';
import { GridDemoComponent } from '../grid/grid-demo';
import { MenuDemoComponent } from '../menu/menu-demo';
import { MessageBoxDemoComponent } from '../message-box/message-box-demo';
import { DejaMonacoEditorDemoComponent } from '../monaco-editor/monaco-editor-demo';
import { MonacoEditorJsonFileResolver, MonacoEditorJsonToCompareFileResolver, MonacoEditorXmlFileResolver, MonacoEditorXmlToCompareFileResolver } from '../monaco-editor/monaco-editor.resolver';
import { ProgressCircleDemoComponent } from '../progress-circle/progress-circle-demo';
import { DejaRangeDemoComponent } from '../range/range-demo';
import { SelectDemoComponent } from '../select/select-demo';
import { DejaSnackbarDemoComponent } from '../snackbar/snackbar-demo';
import { DejaSplitterDemoComponent } from '../splitter/splitter-demo';
import { TextAreaDemoComponent } from '../textarea/textarea-demo';
import { TilesDemoComponent } from '../tiles/tiles-demo';
import { DejaTreeListDemoComponent } from '../tree-list/tree-list-demo';
import { DejaViewPortDemoComponent } from '../viewport/viewport-demo';
import { HomeComponent } from './home-app';
/* deja-cli import demo */
/* The comment above mustn't be removed ! */

const routes: Routes = [
    { component: HomeComponent, path: '' },
    { component: DejaAccordionDemoComponent, path: 'accordion' },
    { component: DejaCircularPickerDemoComponent, path: 'circular-picker' },
    { component: DejaColorSelectorDemoComponent, path: 'colorselector' },
    { component: DejaContentEditableDemoComponent, path: 'contenteditableselector' },
    { component: DejaDatePickerDemoComponent, path: 'date-picker' },
    { component: GlobalEventsDemoComponent, path: 'events' },
    { component: GridDemoComponent, path: 'grid' },
    { component: MenuDemoComponent, path: 'menu' },
    { component: MessageBoxDemoComponent, path: 'message-box' },
    { component: SelectDemoComponent, path: 'select' },
    { component: TextAreaDemoComponent, path: 'textarea' },
    { component: TilesDemoComponent, path: 'tiles' },
    { component: DejaTreeListDemoComponent, path: 'tree-list' },
    { component: ProgressCircleDemoComponent, path: 'progress-circle' },
    {
        component: DejaMonacoEditorDemoComponent, path: 'monaco-editor', resolve: {
            jsonFile: MonacoEditorJsonFileResolver,
            jsonToCompareFile: MonacoEditorJsonToCompareFileResolver,
            xmlFile: MonacoEditorXmlFileResolver,
            xmlToCompareFile: MonacoEditorXmlToCompareFileResolver,
        }
    },
    { component: DejaSnackbarDemoComponent, path: 'snackbar' },
    { component: DejaRangeDemoComponent, path: 'range' },
    { component: DejaSplitterDemoComponent, path: 'splitter' },
    { component: DejaViewPortDemoComponent, path: 'viewport' },
    /* deja-cli route demo */
    /* The comment above mustn't be removed ! */
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);