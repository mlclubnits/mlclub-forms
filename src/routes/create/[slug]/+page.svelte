<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Trash2 } from 'lucide-svelte';

	// `data` comes from load(); `form` comes from action result
	export let data: {
		form_data: any; // expected array of sections
		creator_email: string;
		form_name: string;
		form_hash: string;
		formCloseTime: string;
	};
	console.log(data);
	export let form: { success?: boolean; error?: string };

	interface Section {
		id: number;
		title: string;
		description: string;
		items: Item[];
	}

	interface Item {
		itemType: string;
		id: number;
		question: string;
		placeholder: string;
		description: string;
		photo: string;
		inputType: string;
		optionType: string;
		options: string[];
		required: boolean;
	}

	let formItems: Section[] = [];

	const usermail = data.creator_email;
	const form_hash = data.form_hash;
	$: form_name = data.form_name;

	// We start with the closeTime from server; if the user edits and saves, it will be included
	let closeTime = data.formCloseTime;

	// Initialize formItems on mount by deep-cloning data.form_data
	onMount(() => {
		if (Array.isArray(data.form_data) && data.form_data.length > 0) {
			formItems = data.form_data.map((sec: any) => ({
				id: sec.id ?? Date.now(),
				title: sec.title ?? '',
				description: sec.description ?? '',
				items: Array.isArray(sec.items)
					? sec.items.map((it: any) => ({
							itemType: it.itemType ?? '',
							id: it.id ?? Date.now(),
							question: it.question ?? '',
							placeholder: it.placeholder ?? '',
							description: it.description ?? '',
							photo: it.photo ?? '',
							inputType: it.inputType ?? 'text',
							optionType: it.optionType ?? '',
							options: Array.isArray(it.options) ? [...it.options] : [],
							required: !!it.required
						}))
					: []
			}));
		} else {
			formItems = [
				{
					id: Date.now(),
					title: 'Section Title',
					description: 'This is the first section',
					items: []
				}
			];
		}
	});

	// Drag & Drop state
	let draggedSectionIndex: number | null = null;
	let draggedItemIndex: number | null = null;

	function handleDragStart(sectionIndex: number, itemIndex: number) {
		draggedSectionIndex = sectionIndex;
		draggedItemIndex = itemIndex;
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	function handleDrop(sectionIndex: number, dropIndex: number) {
		if (
			draggedSectionIndex === null ||
			draggedItemIndex === null ||
			sectionIndex !== draggedSectionIndex ||
			draggedItemIndex === dropIndex
		) {
			return;
		}
		const updated = formItems.map((sec, idx) => {
			if (idx !== sectionIndex) return sec;
			return {
				...sec,
				items: sec.items.map((it) => ({ ...it, options: [...it.options] }))
			};
		});

		const sec = { ...updated[sectionIndex], items: [...updated[sectionIndex].items] };
		const [moved] = sec.items.splice(draggedItemIndex, 1);
		sec.items.splice(dropIndex, 0, moved);
		updated[sectionIndex] = sec;
		formItems = updated;

		draggedSectionIndex = draggedItemIndex = null;
	}

	// SECTION / ITEM operations

	function addSection() {
		formItems = [
			...formItems,
			{
				id: Date.now(),
				title: `Section Title`,
				description: `This is section Description`,
				items: []
			}
		];
	}

	function deleteSection(sectionIndex: number) {
		const updated = formItems.map((sec) => ({
			...sec,
			items: sec.items.map((it) => ({ ...it, options: [...it.options] }))
		}));
		updated.splice(sectionIndex, 1);
		formItems = updated;
	}

	function addItem(
		sectionIndex: number,
		type: string = '',
		optionType: string = '',
		options: string[] = []
	) {
		const newItem: Item = {
			itemType: type,
			id: Date.now(),
			question: 'New Question',
			placeholder: 'Enter your answer',
			description: '',
			photo: '',
			inputType: 'text',
			optionType,
			options,
			required: false
		};
		formItems = formItems.map((sec, idx) =>
			idx !== sectionIndex
				? sec
				: {
						...sec,
						items: [...sec.items.map((it) => ({ ...it, options: [...it.options] })), newItem]
					}
		);
	}

	function deleteItem(sectionIndex: number, itemIndex: number) {
		formItems = formItems.map((sec, idx) => {
			if (idx !== sectionIndex) return sec;
			const items = sec.items.map((it) => ({ ...it, options: [...it.options] }));
			items.splice(itemIndex, 1);
			return { ...sec, items };
		});
	}

	function addOption(sectionIndex: number, itemIndex: number) {
		formItems = formItems.map((sec, sIdx) => {
			if (sIdx !== sectionIndex) return sec;
			const items = sec.items.map((it) => ({ ...it, options: [...it.options] }));
			const target = { ...items[itemIndex] };
			target.options.push(`Option ${target.options.length + 1}`);
			items[itemIndex] = target;
			return { ...sec, items };
		});
	}

	function deleteOption(sectionIndex: number, itemIndex: number, optIndex: number) {
		formItems = formItems.map((sec, sIdx) => {
			if (sIdx !== sectionIndex) return sec;
			const items = sec.items.map((it) => ({ ...it, options: [...it.options] }));
			const target = { ...items[itemIndex] };
			target.options.splice(optIndex, 1);
			items[itemIndex] = target;
			return { ...sec, items };
		});
	}

	// Reactive JSON for hidden input
	let formData = '';
	$: formData = JSON.stringify(
		{
			user: {
				email: usermail,
				form_name: form_name,
				form_hash: form_hash,
				closeTime: closeTime
			},
			formItems
		},
		null,
		2
	);

	// If you want to re-fetch server data after success:
	$: if (browser && form?.success) {
		// For example, you could re-fetch the page by navigating to the same URL:
		// However, note that formItems is already up-to-date locally.
		// If you need updated server-generated fields (e.g., new closeTime from DB),
		// you could call `location.reload()` or use SvelteKit's invalidate from the client:
		// import { invalidate } from '$app/navigation';
		// invalidate();
		// But ensure this code runs only in browser, not SSR.
		// Here I choose not to auto-reload; if desired, uncomment below:
		// import { invalidate } from '$app/navigation';
		// invalidate();
		// Alternatively, you could show a “Saved” message and let user stay on the updated local state.
		console.log('Form saved; you may reload or trust local state is current.');
	}
</script>

<section class="flex w-full flex-col items-center p-4">
	<div class="flex w-full justify-between">
		<input type="text" class="w-auto border-none bg-transparent pb-1 text-2xl font-bold" bind:value={data.form_name} />
		
	</div>

	{#if data.formCloseTime}
		<p class="mb-4 text-sm text-gray-600">
			This form will close on {new Date(data.formCloseTime).toLocaleString()}.
		</p>
	{/if}
	{#if form?.error}
		<p class="mb-4 text-red-600">Error: {form.error}</p>
	{/if}
	{#if form?.success}
		<div class="mb-4 !text-green-600">Form saved successfully.</div>
	{/if}

	<form method="POST">
		<input type="hidden" name="formItems" value={formData} />

		{#each formItems as section, sectionIndex (section.id)}
			<div class="relative mb-6 flex w-full flex-col gap-2 rounded-lg border bg-amber-100 p-4">
				{#if formItems.length > 1}
					<button
						type="button"
						class="absolute top-2 right-2 rounded px-2 py-1"
						on:click={() => deleteSection(sectionIndex)}
					>
						<Trash2 class="text-red-500 hover:text-red-600" />
					</button>
				{/if}

				<input
					type="text"
					class="w-full border-b bg-transparent pb-1 text-xl font-semibold"
					value={section.title}
					on:input={(e) => {
						const v = (e.target as HTMLInputElement).value;
						formItems = formItems.map((sec, idx) =>
							idx === sectionIndex ? { ...sec, title: v } : sec
						);
					}}
				/>
				<input
					type="text"
					class="mt-1 text-gray-700"
					value={section.description}
					on:input={(e) => {
						const v = (e.target as HTMLInputElement).value;
						formItems = formItems.map((sec, idx) =>
							idx === sectionIndex ? { ...sec, description: v } : sec
						);
					}}
				/>

				{#if section.items.length > 0}
					<ul>
						{#each section.items as item, itemIndex (item.id)}
							<li
								class="relative mb-2 cursor-grab rounded bg-white p-3 shadow-sm transition-colors hover:bg-gray-50 active:cursor-grabbing"
								draggable="true"
								on:dragstart={() => handleDragStart(sectionIndex, itemIndex)}
								on:dragover={handleDragOver}
								on:drop={() => handleDrop(sectionIndex, itemIndex)}
							>
								{itemIndex + 1}.&nbsp;
								<input
									type="text"
									class="mb-2 w-full border-b bg-transparent pb-1"
									value={item.question}
									on:input={(e) => {
										const v = (e.target as HTMLInputElement).value;
										formItems = formItems.map((sec, sIdx) => {
											if (sIdx !== sectionIndex) return sec;
											const clonedItems = sec.items.map((it) => ({
												...it,
												options: [...it.options]
											}));
											const targetItem = {
												...clonedItems[itemIndex],
												question: v
											};
											clonedItems[itemIndex] = targetItem;
											return { ...sec, items: clonedItems };
										});
									}}
								/>

								{#if item.itemType === 'option'}
									{#each item.options as option, optIndex}
										<div class="flex items-center space-x-2">
											<input type={item.optionType} name={'opt-' + item.id} />
											<input
												type="text"
												class="flex-1 border-b bg-transparent pb-1"
												value={option}
												on:input={(e) => {
													const v = (e.target as HTMLInputElement).value;
													formItems = formItems.map((sec, sIdx) => {
														if (sIdx !== sectionIndex) return sec;
														const clonedItems = sec.items.map((it) => ({
															...it,
															options: [...it.options]
														}));
														const targetItem = {
															...clonedItems[itemIndex],
															options: [...clonedItems[itemIndex].options]
														};
														targetItem.options[optIndex] = v;
														clonedItems[itemIndex] = targetItem;
														return { ...sec, items: clonedItems };
													});
												}}
											/>
											<button
												type="button"
												class="text-red-500 hover:text-red-700"
												on:click={() => deleteOption(sectionIndex, itemIndex, optIndex)}
											>
												Delete
											</button>
										</div>
									{/each}

									<div class="mt-2 flex items-center space-x-2">
										<select
											class="rounded border bg-white px-2 py-1"
											value={item.optionType}
											on:change={(e) => {
												const newType = (e.target as HTMLSelectElement).value;
												formItems = formItems.map((sec, sIdx) => {
													if (sIdx !== sectionIndex) return sec;
													const clonedItems = sec.items.map((it) => ({
														...it,
														options: [...it.options]
													}));
													const targetItem = {
														...clonedItems[itemIndex],
														optionType: newType
													};
													clonedItems[itemIndex] = targetItem;
													return { ...sec, items: clonedItems };
												});
											}}
										>
											<option value="radio">Radio</option>
											<option value="checkbox">Checkbox</option>
										</select>
										<button
											type="button"
											class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
											on:click={() => addOption(sectionIndex, itemIndex)}
										>
											Add Option
										</button>
									</div>
								{:else if item.itemType === 'text'}
									<div class="mt-2">
										<input
											type={item.inputType}
											placeholder={item.placeholder}
											class="w-full rounded border px-2 py-1"
											disabled
										/>
									</div>
								{:else}
									<p class="mt-2 text-red-600">Unknown item type: {item.itemType}</p>
								{/if}

								{#if item.description}
									<p class="mt-2 text-gray-600">{item.description}</p>
								{/if}
								{#if item.photo}
									<img src={item.photo} alt="Item" class="mt-2 h-24 w-auto object-cover" />
								{/if}

								<button
									type="button"
									class="absolute top-2 right-2 text-red-500 hover:text-red-700"
									on:click={() => deleteItem(sectionIndex, itemIndex)}
								>
									Delete Item
								</button>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="mb-4 text-gray-600">No items in this section.</p>
				{/if}

				<div class="mt-4 flex space-x-2">
					<button
						type="button"
						class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
						on:click={() => addItem(sectionIndex, 'text')}
					>
						Add Text Item
					</button>
					<button
						type="button"
						class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
						on:click={() => addItem(sectionIndex, 'option', 'radio', ['Option A', 'Option B'])}
					>
						Add Option Item
					</button>
				</div>
			</div>
		{/each}

		<button
			type="button"
			class="mb-6 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
			on:click={addSection}
		>
			Add Section
		</button>

		<button type="submit" class="mb-6 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
			Publish Form
		</button>
	</form>

	<!-- Optional: show the JSON for debugging -->
	<!-- <pre class="w-full max-w-md rounded border bg-gray-100 p-4 text-sm whitespace-pre-wrap">
{formData}
  </pre> -->
</section>

<style>
	ul {
		padding: 0;
		list-style-type: none;
	}
	li {
		user-select: none;
	}
	input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
