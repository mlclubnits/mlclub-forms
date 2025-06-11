<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto, invalidate } from '$app/navigation';

	// Action to detect clicks outside a node
	export function clickOutside(node: HTMLElement, callback: () => void) {
		const handleClick = (event: MouseEvent) => {
			if (!node.contains(event.target as Node)) {
				callback();
			}
		};
		document.addEventListener('mousedown', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('mousedown', handleClick, true);
			}
		};
	}

	export let id: number;
	export let formName: string | null;
	export let createdAt: string;
	export let formHash: string;
	export let userEmail: string;

	let showMenu = false;
	let showRename = false;
	let showDeleteConfirm = false;
	let newName = formName || '';

	let menuRef: HTMLElement;

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function handleRename() {
		newName = formName || '';
		showRename = true;
		showMenu = false;
	}

	async function submitRename() {
		const { error } = await supabase.from('forms').update({ form_name: newName }).eq('id', id);
		showRename = false;
		if (error) {
			console.error('Rename error:', error);
			return;
		}
		window.location.reload();
	}

	function handleDelete() {
		showDeleteConfirm = true;
		showMenu = false;
	}

	async function confirmDelete() {
		const { error } = await supabase.from('forms').delete().eq('id', id);
		showDeleteConfirm = false;
		if (error) {
			console.error('Delete error:', error);
			return;
		}
		window.location.reload();
	}
</script>

<!-- Card Component -->
<div
	class="min-w-4xs relative mr-3 mb-8 ml-3 flex flex-col overflow-hidden rounded-xl bg-white shadow-md sm:w-full md:mb-0 md:w-1/3 md:min-w-2xs"
>
	<button
		onclick={() => goto(`/create/${formHash}`)}
		class="relative flex h-30 w-full items-center justify-between bg-gray-200 px-4 text-left"
	>
		<img
			src="/placeholder.png"
			alt="Form Thumbnail"
			class="absolute inset-0 h-full w-full object-cover opacity-10"
		/>
	</button>

	<!-- Form Content -->
	<div class="relative z-5 w-full px-5 pb-4 pt-2 text-left">
		<div class="mb-2 flex items-center justify-between">
			<button class="text-md font-semibold" onclick={() => goto(`/create/${formHash}`)}>
				{formName || 'Untitled Form'}
			</button>
			<!-- Menu Button -->
			<button
				type="button"
				class="relative z-10 p-2"
				onclick={toggleMenu}
				aria-label="Open options"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-gray-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6v.01M12 12v.01M12 18v.01"
					/>
				</svg>
			</button>
		</div>
		<button class="text-sm text-gray-500" 
		onclick={() => goto(`/create/${formHash}`)}>Created at: {new Date(createdAt).toLocaleString()}</button>
	</div>

	<!-- Dropdown Menu -->
	{#if showMenu}
		<div
			bind:this={menuRef}
			use:clickOutside={() => (showMenu = false)}
			class="absolute top-10 right-2 z-20 w-32 rounded bg-white shadow-lg"
		>
			<button class="block w-full px-4 py-2 text-left hover:bg-gray-100" onclick={handleRename}
				>Rename</button
			>
			<button class="block w-full px-4 py-2 text-left hover:bg-gray-100" onclick={handleDelete}
				>Delete</button
			>
		</div>
	{/if}

	<!-- Rename Modal -->
	{#if showRename}
		<div
			class="bg-opacity-50 fixed inset-0 z-30 flex items-center justify-center bg-transparent backdrop-blur-sm"
		>
			<div class="w-80 rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-medium">Rename Form</h3>
				<input type="text" class="mb-4 w-full rounded border px-3 py-2" bind:value={newName} />
				<div class="flex justify-end space-x-2">
					<button class="rounded bg-gray-200 px-4 py-2" onclick={() => (showRename = false)}
						>Cancel</button
					>
					<button class="rounded bg-blue-600 px-4 py-2 text-white" onclick={submitRename}
						>Submit</button
					>
				</div>
			</div>
		</div>
	{/if}

	<!-- Delete Confirm Modal -->
	{#if showDeleteConfirm}
		<div
			class="bg-opacity-50 fixed inset-0 z-30 flex items-center justify-center bg-transparent backdrop-blur-sm"
		>
			<div class="w-80 rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-medium">Confirm Delete</h3>
				<p class="mb-4">Are you sure you want to delete this form?</p>
				<div class="flex justify-end space-x-2">
					<button class="rounded bg-gray-200 px-4 py-2" onclick={() => (showDeleteConfirm = false)}
						>Cancel</button
					>
					<button class="rounded bg-red-600 px-4 py-2 text-white" onclick={confirmDelete}
						>Delete</button
					>
				</div>
			</div>
		</div>
	{/if}
</div>
