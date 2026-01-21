/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IReleaseNotesData, IRelease, IReleaseNote, ReleaseNoteType } from '../common/dipoleReleaseNotes.js';
import { escape } from '../../../../base/common/strings.js';

/**
 * Badge colors for each release note type
 */
const TYPE_BADGE_COLORS: Record<ReleaseNoteType, { color: string; bg: string }> = {
	'Breaking Change': { color: '#fff', bg: 'var(--vscode-errorForeground)' },
	'Feature': { color: '#fff', bg: 'var(--vscode-testing-iconPassed)' },
	'Improvement': { color: '#fff', bg: 'var(--vscode-notificationsInfoIcon-foreground)' },
	'Fix': { color: '#fff', bg: 'var(--vscode-editorWarning-foreground)' },
	'Security': { color: '#fff', bg: 'var(--vscode-charts-purple)' },
};

/**
 * Renders the complete release notes HTML document
 */
export function renderReleaseNotesToHtml(data: IReleaseNotesData, nonce: string, productName: string): string {
	const releasesHtml = data.releases.map(release => renderRelease(release)).join('');

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; img-src https: data:;">
	<title>${escape(productName)} Release Notes</title>
	<style nonce="${nonce}">
		:root {
			--section-spacing: 32px;
			--note-spacing: 16px;
		}

		* {
			box-sizing: border-box;
		}

		body {
			font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
			font-size: var(--vscode-font-size, 13px);
			color: var(--vscode-foreground);
			background: var(--vscode-editor-background);
			padding: 24px;
			margin: 0;
			line-height: 1.6;
		}

		h1 {
			font-size: 2em;
			font-weight: 600;
			margin: 0 0 var(--section-spacing) 0;
			color: var(--vscode-foreground);
			border-bottom: 1px solid var(--vscode-panel-border);
			padding-bottom: 16px;
		}

		.release {
			margin-bottom: var(--section-spacing);
			padding-bottom: var(--section-spacing);
			border-bottom: 1px solid var(--vscode-panel-border);
		}

		.release:last-child {
			border-bottom: none;
		}

		.release-header {
			display: flex;
			align-items: baseline;
			gap: 12px;
			margin-bottom: 12px;
		}

		.version {
			font-size: 1.4em;
			font-weight: 600;
			color: var(--vscode-foreground);
		}

		.date {
			font-size: 0.9em;
			color: var(--vscode-descriptionForeground);
		}

		.release-description {
			color: var(--vscode-foreground);
			margin-bottom: var(--note-spacing);
			font-style: italic;
		}

		.notes {
			display: flex;
			flex-direction: column;
			gap: var(--note-spacing);
		}

		.note {
			display: flex;
			flex-direction: column;
			gap: 4px;
			padding: 12px;
			background: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 6px;
			border-left: 3px solid var(--vscode-focusBorder);
		}

		.note-header {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-wrap: wrap;
		}

		.badge {
			display: inline-block;
			padding: 2px 8px;
			border-radius: 4px;
			font-size: 0.75em;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}

		.note-title {
			font-weight: 600;
			color: var(--vscode-foreground);
		}

		.note-link {
			color: var(--vscode-textLink-foreground);
			text-decoration: none;
			font-size: 0.9em;
		}

		.note-link:hover {
			text-decoration: underline;
			color: var(--vscode-textLink-activeForeground);
		}

		.note-description {
			color: var(--vscode-descriptionForeground);
			margin: 0;
		}

		@media (max-width: 600px) {
			body {
				padding: 16px;
			}

			.release-header {
				flex-direction: column;
				gap: 4px;
			}
		}
	</style>
</head>
<body>
	<h1>${escape(productName)} Release Notes</h1>
	${releasesHtml}
</body>
</html>`;
}

/**
 * Renders a single release section
 */
function renderRelease(release: IRelease): string {
	const notesHtml = release.notes.map(note => renderNote(note)).join('');
	const descriptionHtml = release.description
		? `<p class="release-description">${escape(release.description)}</p>`
		: '';

	return `
	<section class="release">
		<header class="release-header">
			<span class="version">v${escape(release.version)}</span>
			<span class="date">${escape(release.date)}</span>
		</header>
		${descriptionHtml}
		<div class="notes">
			${notesHtml}
		</div>
	</section>`;
}

/**
 * Renders a single release note
 */
function renderNote(note: IReleaseNote): string {
	const badgeStyle = TYPE_BADGE_COLORS[note.type] || TYPE_BADGE_COLORS['Feature'];
	const linkHtml = note.link
		? `<a class="note-link" href="${escape(note.link)}" title="Learn more">Learn more &rarr;</a>`
		: '';

	return `
	<article class="note">
		<div class="note-header">
			<span class="badge" style="background:${badgeStyle.bg};color:${badgeStyle.color}">${escape(note.type)}</span>
			<span class="note-title">${escape(note.title)}</span>
			${linkHtml}
		</div>
		<p class="note-description">${escape(note.description)}</p>
	</article>`;
}

/**
 * Simple YAML parser for the release notes format
 * Handles only the subset needed: arrays, objects, and string values
 */
export function parseSimpleYaml(content: string): IReleaseNotesData {
	const lines = content.split('\n');
	const releases: IRelease[] = [];
	let currentRelease: IRelease | null = null;
	let currentNote: Partial<IReleaseNote> | null = null;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		// Skip empty lines and comments
		if (!trimmed || trimmed.startsWith('#')) {
			continue;
		}

		// Calculate indentation level (2 spaces = 1 level)
		const indent = line.search(/\S/);
		const level = Math.floor(indent / 2);

		// Array item marker
		if (trimmed.startsWith('- ')) {
			const value = trimmed.substring(2).trim();

			if (level === 1) {
				// New release entry (under releases:)
				if (currentRelease) {
					if (currentNote && currentNote.title) {
						currentRelease.notes.push(currentNote as IReleaseNote);
					}
					releases.push(currentRelease);
				}
				currentRelease = { version: '', date: '', notes: [] };
				currentNote = null;

				// Handle inline key-value: - version: "1.0.0"
				const match = value.match(/^(\w+):\s*["']?([^"']+)["']?$/);
				if (match) {
					const [, key, val] = match;
					assignReleaseField(currentRelease, key, val);
				}
			} else if (level === 2 && currentRelease) {
				// New note entry (under notes:)
				if (currentNote && currentNote.title) {
					currentRelease.notes.push(currentNote as IReleaseNote);
				}
				currentNote = { type: 'Feature' };

				// Handle inline key-value
				const match = value.match(/^(\w+):\s*["']?([^"']+)["']?$/);
				if (match) {
					const [, key, val] = match;
					assignNoteField(currentNote, key, val);
				}
			}
		} else {
			// Key-value pair
			const match = trimmed.match(/^(\w+):\s*["']?([^"']*)["']?$/);
			if (match) {
				const [, key, value] = match;

				if (level === 2 && currentRelease) {
					// Release properties (version, date, description)
					assignReleaseField(currentRelease, key, value);
				} else if (level === 3 && currentNote) {
					// Note properties (title, description, type, link)
					assignNoteField(currentNote, key, value);
				}
			}
		}
	}

	// Don't forget the last release and note
	if (currentRelease) {
		if (currentNote && currentNote.title) {
			currentRelease.notes.push(currentNote as IReleaseNote);
		}
		releases.push(currentRelease);
	}

	return { releases };
}

function assignReleaseField(release: IRelease, key: string, value: string): void {
	switch (key) {
		case 'version':
			release.version = value;
			break;
		case 'date':
			release.date = value;
			break;
		case 'description':
			release.description = value;
			break;
	}
}

function assignNoteField(note: Partial<IReleaseNote>, key: string, value: string): void {
	switch (key) {
		case 'title':
			note.title = value;
			break;
		case 'description':
			note.description = value;
			break;
		case 'type':
			note.type = value as ReleaseNoteType;
			break;
		case 'link':
			note.link = value;
			break;
	}
}
