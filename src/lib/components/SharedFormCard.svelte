<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto, invalidate } from '$app/navigation';

	// Props (from joined data)
	export let id: number;
	export let formName: string | null;
	export let createdAt: string;
	export let formHash: string;
	export let backgroundSettings: {
		useGradient: boolean;
		backgroundColor: string;
		gradientDirection: string;
		gradientColor1: string;
		gradientColor2: string;
	}[];
	export let userEmail: string; // Logged in user's email
	export let creatorEmail: string; // Form creator's email

	let isOwner = userEmail === creatorEmail;

	// Rename/Delete/Share States
	let showMenu = false;
	let showRename = false;
	let showDeleteConfirm = false;
	let showShareDialog = false;
	let newName = formName || '';
	let menuRef: HTMLElement;

	let sharedEmails: string[] = [];
	let newEmail = '';

	// Click Outside
	export function clickOutside(node: HTMLElement, callback: () => void) {
		const handleClick = (event: MouseEvent) => {
			if (!node.contains(event.target as Node)) callback();
		};
		document.addEventListener('mousedown', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('mousedown', handleClick, true);
			}
		};
	}

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
		if (error) return console.error('Rename error:', error);
		window.location.reload();
	}

	function handleDelete() {
		showDeleteConfirm = true;
		showMenu = false;
	}

	async function confirmDelete() {
		const { error } = await supabase.from('forms').delete().eq('id', id);
		showDeleteConfirm = false;
		if (error) return console.error('Delete error:', error);
		window.location.reload();
	}

	async function openShareDialog() {
		const { data, error } = await supabase
			.from('forms')
			.select('shared_with')
			.eq('id', id)
			.single();

		if (error) return console.error('Error fetching shared emails:', error);
		sharedEmails = data?.shared_with || [];
		showShareDialog = true;
		showMenu = false;
	}

	async function addEmail() {
		if (!newEmail || sharedEmails.includes(newEmail)) return;

		const updatedEmails = [...sharedEmails, newEmail];
		const { error } = await supabase
			.from('forms')
			.update({ shared_with: updatedEmails })
			.eq('id', id);

		if (error) return console.error('Add email error:', error);
		sharedEmails = updatedEmails;
		newEmail = '';
	}

	async function removeEmail(emailToRemove: string) {
		const updatedEmails = sharedEmails.filter((email) => email !== emailToRemove);
		const { error } = await supabase
			.from('forms')
			.update({ shared_with: updatedEmails })
			.eq('id', id);

		if (error) return console.error('Remove email error:', error);
		sharedEmails = updatedEmails;
	}
</script>

<!-- Card Component -->
<div
	class="min-w-4xs relative mr-3 mb-8 ml-3 flex flex-col overflow-hidden rounded-xl bg-white shadow-md sm:w-full md:mb-0 md:w-1/3 md:min-w-2xs"
>
	{#if backgroundSettings[0]?.useGradient}
		<button
			onclick={() => goto(`/create/${formHash}`)}
			class="relative flex h-30 w-full items-center justify-between px-4 text-left"
			style="background: linear-gradient({backgroundSettings[0]
				.gradientColor1}, {backgroundSettings[0].gradientColor2});"
			aria-label="Open form"
		>
		</button>
	{:else}
		<button
			onclick={() => goto(`/create/${formHash}`)}
			class="relative flex h-30 w-full items-center justify-between px-4 text-left"
			style="background-color: {backgroundSettings[0].backgroundColor};"
			aria-label="Open form"
		>
		</button>
	{/if}

	<!-- Form Content -->
	<div class="relative z-5 w-full border-t px-5 pt-2 pb-4 text-left">
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
		<button class="text-sm text-gray-500" onclick={() => goto(`/create/${formHash}`)}
			>Created at: {new Date(createdAt).toLocaleString()}</button
		>
	</div>

	<!-- Dropdown Menu -->
	{#if showMenu}
		<div
			bind:this={menuRef}
			use:clickOutside={() => (showMenu = false)}
			class="absolute top-24 right-8 z-20 w-32 rounded bg-white shadow-lg"
		>
			<button class="block w-full px-4 py-2 text-left hover:bg-gray-100" onclick={handleRename}
				>Rename</button
			>
		</div>
	{/if}

	{#if showShareDialog}
		<div
			class="bg-opacity-50 fixed inset-0 z-30 flex items-center justify-center bg-transparent backdrop-blur-sm"
		>
			<div class="w-96 rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-semibold">Share Form</h3>
				<div class="mb-4">
					<p class="mb-2 font-medium">Already shared with:</p>
					{#if sharedEmails.length === 0}
						<p class="text-sm text-gray-500">No emails shared yet.</p>
					{:else}
						<ul class="text-md flex list-disc flex-col gap-2 pl-5">
							{#each sharedEmails as email}
								<li class="flex items-center justify-between">
									<span>{email}</span>
									<button class="ml-2 text-xs text-red-500" onclick={() => removeEmail(email)}>
										Remove
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				<div class="mb-4">
					<input
						type="email"
						class="w-full rounded border px-3 py-2 text-sm"
						bind:value={newEmail}
						placeholder="Enter email to share"
					/>
				</div>
				<div class="flex justify-end space-x-2">
					<button class="rounded bg-gray-200 px-4 py-2" onclick={() => (showShareDialog = false)}>
						Close
					</button>
					<button class="rounded bg-blue-500 px-4 py-2 text-white" onclick={addEmail}>
						Add Email
					</button>
				</div>
			</div>
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
					<button
						class="rounded bg-sky-100 px-4 py-2 font-semibold text-blue-600"
						onclick={submitRename}>Submit</button
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
			<div class="confirm-dialog fixed inset-0 z-50 flex items-center justify-center backdrop-blur">
				<div class="relative min-h-screen px-4 md:flex md:items-center md:justify-center">
					<div class=" absolute inset-0 z-10 h-full w-full opacity-25"></div>
					<div
						class="fixed inset-x-0 bottom-0 z-50 mx-4 mb-4 rounded-lg bg-white p-4 shadow-lg md:relative md:mx-auto md:max-w-md"
					>
						<div class="items-center md:flex">
							<div
								class="mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-gray-300"
							>
								<i class="bx bx-error text-3xl"> &#9888; </i>
							</div>
							<div class="mt-4 text-center md:mt-0 md:ml-6 md:text-left">
								<p class="font-bold">Warning!</p>
								<p class="mt-1 text-sm text-gray-700">
									You will lose all of your data by deleting this. This action cannot be undone.
								</p>
							</div>
						</div>
						<div class="mt-4 text-center md:flex md:justify-end md:text-right">
							<button
								id="confirm-delete-btn"
								class="block w-full rounded-lg bg-red-200 px-4 py-3 text-sm font-semibold text-red-700 md:order-2 md:ml-2 md:inline-block md:w-auto md:py-2"
								onclick={confirmDelete}
							>
								Delete
							</button>
							<button
								id="confirm-cancel-btn"
								class="mt-4 block w-full rounded-lg bg-gray-200 px-4 py-3 text-sm font-semibold md:order-1 md:mt-0 md:inline-block md:w-auto md:py-2"
								onclick={() => (showDeleteConfirm = false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
			<!-- <div class="w-80 rounded-lg bg-white p-6 shadow-lg">
				<h3 class="mb-4 text-lg font-medium">Confirm Delete</h3>
				<p class="mb-4">Are you sure you want to delete this form?</p>
				<div class="flex justify-end space-x-2">
					<button class="rounded bg-gray-200 px-4 py-2">Cancel</button>
					<button class="rounded bg-red-600 px-4 py-2 text-white">Delete</button>
				</div>
			</div> -->
		</div>
	{/if}
</div>

<style>
	button {
		cursor: pointer;
	}
</style>
