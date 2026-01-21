/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { ACTIVE_GROUP } from '../../../services/editor/common/editorService.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { DIPOLE_RELEASE_NOTES_VIEW_TYPE, DIPOLE_RELEASE_NOTES_RESOURCE_PATH } from '../common/dipoleReleaseNotes.js';
import { renderReleaseNotesToHtml, parseSimpleYaml } from './dipoleReleaseNotesRenderer.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { INativeEnvironmentService } from '../../../../platform/environment/common/environment.js';

export class DipoleReleaseNotesManager extends Disposable {
	private _currentWebview: WebviewInput | undefined;

	constructor(
		@IWebviewWorkbenchService private readonly _webviewWorkbenchService: IWebviewWorkbenchService,
		@IEditorGroupsService private readonly _editorGroupService: IEditorGroupsService,
		@IProductService private readonly _productService: IProductService,
		@IFileService private readonly _fileService: IFileService,
		@IOpenerService private readonly _openerService: IOpenerService,
		@INativeEnvironmentService private readonly _environmentService: INativeEnvironmentService,
	) {
		super();
	}

	/**
	 * Shows the dipoleSTUDIO release notes in a webview
	 */
	async show(): Promise<void> {
		try {
			// Load and parse the YAML release notes
			const yamlContent = await this.loadReleaseNotesYaml();
			const data = parseSimpleYaml(yamlContent);

			// Generate HTML content
			const nonce = generateUuid();
			const productName = this._productService.nameLong || 'dipoleSTUDIO';
			const html = renderReleaseNotesToHtml(data, nonce, productName);

			// Create or reuse webview
			const title = `${productName} Release Notes`;

			if (this._currentWebview && !this._currentWebview.isDisposed()) {
				// Reuse existing webview
				this._currentWebview.setWebviewTitle(title);
				this._currentWebview.webview.setHtml(html);
				this._webviewWorkbenchService.revealWebview(
					this._currentWebview,
					this._editorGroupService.activeGroup,
					false
				);
			} else {
				// Create new webview
				this._currentWebview = this._webviewWorkbenchService.openWebview(
					{
						title,
						options: {
							tryRestoreScrollPosition: true,
							enableFindWidget: true,
						},
						contentOptions: {
							localResourceRoots: [],
							allowScripts: false,
						},
						extension: undefined,
					},
					DIPOLE_RELEASE_NOTES_VIEW_TYPE,
					title,
					undefined,
					{ group: ACTIVE_GROUP, preserveFocus: false }
				);

				// Setup disposables
				const disposables = new DisposableStore();

				// Handle link clicks
				disposables.add(this._currentWebview.webview.onDidClickLink(uri => {
					this._openerService.open(URI.parse(uri));
				}));

				// Cleanup when webview is disposed
				disposables.add(this._currentWebview.onWillDispose(() => {
					disposables.dispose();
					this._currentWebview = undefined;
				}));

				this._currentWebview.webview.setHtml(html);
			}
		} catch (error) {
			// If loading fails, provide a fallback message
			console.error('Failed to load dipoleSTUDIO release notes:', error);
			const html = this.renderErrorHtml(error);
			const title = 'Release Notes - Error';

			if (this._currentWebview && !this._currentWebview.isDisposed()) {
				this._currentWebview.webview.setHtml(html);
				this._webviewWorkbenchService.revealWebview(
					this._currentWebview,
					this._editorGroupService.activeGroup,
					false
				);
			} else {
				this._currentWebview = this._webviewWorkbenchService.openWebview(
					{
						title,
						options: {},
						contentOptions: { localResourceRoots: [] },
						extension: undefined,
					},
					DIPOLE_RELEASE_NOTES_VIEW_TYPE,
					title,
					undefined,
					{ group: ACTIVE_GROUP, preserveFocus: false }
				);
				this._currentWebview.webview.setHtml(html);
			}
		}
	}

	/**
	 * Loads the release notes YAML file from resources
	 */
	private async loadReleaseNotesYaml(): Promise<string> {
		const resourceUri = this.getResourceUri();
		const content = await this._fileService.readFile(resourceUri);
		return content.value.toString();
	}

	/**
	 * Gets the URI for the release notes YAML file
	 */
	private getResourceUri(): URI {
		// Use appRoot from environment service to get the correct path
		return URI.joinPath(URI.file(this._environmentService.appRoot), DIPOLE_RELEASE_NOTES_RESOURCE_PATH);
	}

	/**
	 * Renders an error message when loading fails
	 */
	private renderErrorHtml(error: unknown): string {
		const nonce = generateUuid();
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}';">
	<style nonce="${nonce}">
		body {
			font-family: var(--vscode-font-family);
			padding: 24px;
			color: var(--vscode-foreground);
			background: var(--vscode-editor-background);
		}
		.error {
			padding: 16px;
			background: var(--vscode-inputValidation-errorBackground);
			border: 1px solid var(--vscode-inputValidation-errorBorder);
			border-radius: 4px;
		}
		.error-title {
			font-weight: 600;
			margin-bottom: 8px;
		}
		.error-message {
			color: var(--vscode-descriptionForeground);
		}
	</style>
</head>
<body>
	<div class="error">
		<div class="error-title">Unable to load release notes</div>
		<div class="error-message">${errorMessage}</div>
	</div>
</body>
</html>`;
	}

	override dispose(): void {
		if (this._currentWebview) {
			this._currentWebview.dispose();
			this._currentWebview = undefined;
		}
		super.dispose();
	}
}
