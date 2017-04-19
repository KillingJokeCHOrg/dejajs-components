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

import { Component } from '@angular/core';

import { IEditorLanguage } from '../../component/monaco-editor/options/editor-language.model';

@Component({
    selector: 'deja-accordion-demo',
    styleUrls: ['./accordion-demo.scss'],
    templateUrl: './accordion-demo.html',
})
export class DejaAccordionDemoComponent {
    protected tabIndex = 1;

    protected exampleValue = `
  <deja-accordion>
      <deja-accordion-group>
          <!-- loop here -->
          <deja-accordion-header></deja-accordion-header>
          <deja-accordion-body></deja-accordion-body>
      </deja-accordion-group>
  </deja-accordion>`;
    protected html = IEditorLanguage.HTML;

    constructor() { }

}