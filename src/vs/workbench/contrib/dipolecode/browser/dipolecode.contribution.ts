/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IDialogService, IPromptButton } from '../../../../platform/dialogs/common/dialogs.js';
import Severity from '../../../../base/common/severity.js';

/**
 * Arguments for the native modal command
 */
interface INativeModalArgs {
	/** Modal ID for identification */
	id: string;
	/** Dialog title */
	title: string;
	/** Main message/heading */
	message: string;
	/** Detailed description */
	detail?: string;
	/** Dialog type: 'info' | 'warning' | 'error' | 'question' */
	type?: 'info' | 'warning' | 'error' | 'question';
	/** Buttons configuration */
	buttons: Array<{
		id: string;
		label: string;
		primary?: boolean;
	}>;
}

/**
 * Result returned from the native modal
 */
interface INativeModalResult {
	/** ID of the button that was clicked */
	buttonId: string;
	/** Whether the dialog was cancelled */
	cancelled: boolean;
}

/**
 * Command to show a native modal dialog with full-app overlay
 * This is used by dipoleCODE extension for AFWK initialization dialogs
 */
class ShowNativeModalCommand extends Action2 {

	constructor() {
		super({
			id: 'dipolecode.showNativeModal',
			title: nls.localize2('dipolecode.showNativeModal', "Show dipoleCODE Native Modal"),
			f1: false,
			metadata: {
				description: nls.localize('dipolecode.showNativeModal.description', "Shows a native modal dialog with full-app overlay"),
				args: [
					{
						name: 'args',
						schema: {
							type: 'object',
							required: ['id', 'title', 'message', 'buttons'],
							properties: {
								id: { type: 'string' },
								title: { type: 'string' },
								message: { type: 'string' },
								detail: { type: 'string' },
								type: { type: 'string', enum: ['info', 'warning', 'error', 'question'] },
								buttons: {
									type: 'array',
									items: {
										type: 'object',
										required: ['id', 'label'],
										properties: {
											id: { type: 'string' },
											label: { type: 'string' },
											primary: { type: 'boolean' }
										}
									}
								}
							}
						}
					}
				]
			}
		});
	}

	async run(accessor: ServicesAccessor, args: unknown): Promise<INativeModalResult> {
		const dialogService = accessor.get(IDialogService);

		if (!this._isValidArgs(args)) {
			return { buttonId: '', cancelled: true };
		}

		const severity = this._getSeverity(args.type);

		// Build buttons array for prompt
		// The first button is the primary, rest are secondary
		// We need to track which button was clicked by its ID
		const buttonResults: Map<number, string> = new Map();
		const buttons: IPromptButton<string>[] = [];

		// Sort buttons: primary first, then others
		const sortedButtons = [...args.buttons].sort((a, b) => {
			if (a.primary && !b.primary) {
				return -1;
			}
			if (!a.primary && b.primary) {
				return 1;
			}
			return 0;
		});

		sortedButtons.forEach((btn, index) => {
			buttonResults.set(index, btn.id);
			buttons.push({
				label: btn.label,
				run: () => btn.id
			});
		});

		try {
			const result = await dialogService.prompt<string>({
				type: severity,
				message: args.title,
				detail: args.detail ? `${args.message}\n\n${args.detail}` : args.message,
				buttons,
				cancelButton: {
					label: nls.localize('cancel', "Cancel"),
					run: () => '__cancelled__'
				}
			});

			if (result.result === '__cancelled__' || result.result === undefined) {
				return { buttonId: '', cancelled: true };
			}

			return { buttonId: result.result, cancelled: false };
		} catch (error) {
			return { buttonId: '', cancelled: true };
		}
	}

	private _isValidArgs(args: unknown): args is INativeModalArgs {
		if (!args || typeof args !== 'object') {
			return false;
		}
		const a = args as Record<string, unknown>;
		if (typeof a.id !== 'string' || typeof a.title !== 'string' || typeof a.message !== 'string') {
			return false;
		}
		if (!Array.isArray(a.buttons) || a.buttons.length === 0) {
			return false;
		}
		for (const btn of a.buttons) {
			if (typeof btn !== 'object' || typeof btn.id !== 'string' || typeof btn.label !== 'string') {
				return false;
			}
		}
		return true;
	}

	private _getSeverity(type?: string): Severity {
		switch (type) {
			case 'error':
				return Severity.Error;
			case 'warning':
				return Severity.Warning;
			case 'question':
				return Severity.Info;
			case 'info':
			default:
				return Severity.Info;
		}
	}
}

registerAction2(ShowNativeModalCommand);
