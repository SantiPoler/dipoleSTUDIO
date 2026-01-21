/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Type of release note entry for visual categorization
 */
export type ReleaseNoteType = 'Breaking Change' | 'Feature' | 'Improvement' | 'Fix' | 'Security';

/**
 * Individual release note entry
 */
export interface IReleaseNote {
	title: string;
	description: string;
	type: ReleaseNoteType;
	link?: string;
}

/**
 * A single release containing multiple notes
 */
export interface IRelease {
	version: string;
	date: string;
	description?: string;
	notes: IReleaseNote[];
}

/**
 * Root structure of the release notes data
 */
export interface IReleaseNotesData {
	releases: IRelease[];
}

// Command IDs
export const DIPOLE_SHOW_RELEASE_NOTES_ACTION_ID = 'dipole.showReleaseNotes';

// Webview identifier
export const DIPOLE_RELEASE_NOTES_VIEW_TYPE = 'dipoleReleaseNotes';

// Resource path (relative to app root)
export const DIPOLE_RELEASE_NOTES_RESOURCE_PATH = 'resources/dipole/release-notes.yaml';
