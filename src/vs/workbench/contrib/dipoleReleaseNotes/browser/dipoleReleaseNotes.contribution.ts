/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize2 } from '../../../../nls.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { DIPOLE_SHOW_RELEASE_NOTES_ACTION_ID } from '../common/dipoleReleaseNotes.js';
import { DipoleReleaseNotesManager } from './dipoleReleaseNotesManager.js';

let managerInstance: DipoleReleaseNotesManager | undefined;

/**
 * Gets or creates the DipoleReleaseNotesManager singleton
 */
function getManager(instantiationService: IInstantiationService): DipoleReleaseNotesManager {
	if (!managerInstance) {
		managerInstance = instantiationService.createInstance(DipoleReleaseNotesManager);
	}
	return managerInstance;
}

/**
 * Shows the dipoleSTUDIO release notes
 */
export async function showDipoleReleaseNotes(instantiationService: IInstantiationService): Promise<void> {
	const manager = getManager(instantiationService);
	await manager.show();
}

/**
 * Action to show dipoleSTUDIO release notes
 */
class ShowDipoleReleaseNotesAction extends Action2 {
	constructor() {
		super({
			id: DIPOLE_SHOW_RELEASE_NOTES_ACTION_ID,
			title: localize2('showDipoleReleaseNotes', "dipoleSTUDIO Release Notes"),
			category: Categories.Help,
			f1: true,
			menu: [{
				id: MenuId.MenubarHelpMenu,
				group: '1_welcome',
				order: 6, // After VS Code's Release Notes (order 5)
			}]
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const instantiationService = accessor.get(IInstantiationService);
		await showDipoleReleaseNotes(instantiationService);
	}
}

// Register the action
registerAction2(ShowDipoleReleaseNotesAction);
