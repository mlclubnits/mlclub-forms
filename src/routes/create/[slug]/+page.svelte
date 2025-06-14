<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Trash2, GripVertical, GripHorizontal, Share, Link, Copy } from 'lucide-svelte'; // Import GripVertical for drag handle

	// `data` comes from load(); `form` comes from action result
	export let data: {
		form_data: any; // expected array of sections
		creator_email: string;
		form_name: string;
		form_hash: string;
		formCloseTime: string;
		backgroundSettings: [
			{
				useGradient: boolean;
				backgroundColor: string;
				gradientDirection: string;
				gradientColor1: string;
				gradientColor2: string;
			}
		];
	} = {
		form_data: [],
		creator_email: '',
		form_name: '',
		form_hash: '',
		formCloseTime: '',
		backgroundSettings: [
			{
				useGradient: false,
				backgroundColor: '#ffffff',
				gradientDirection: 'to-r',
				gradientColor1: '#fuchsia-400',
				gradientColor2: '#purple-600'
			}
		]
	};
	// console.log(data);
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
	// Ensure closeTime is in 'YYYY-MM-DDTHH:mm' format for datetime-local input
	function toDatetimeLocal(val: string) {
		if (!val) return '';
		const d = new Date(val);
		if (isNaN(d.getTime())) return '';
		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}
	let closeTime = toDatetimeLocal(data.formCloseTime);

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
	let isDragging: boolean = false; // New state variable for drag operation
	$: inputElemDisplay = isDragging ? 'none' : 'block';

	function handleDragStart(event: DragEvent, sectionIndex: number, itemIndex: number) {
		draggedSectionIndex = sectionIndex;
		draggedItemIndex = itemIndex;
		isDragging = true; // Set dragging state to true
		inputElemDisplay = 'none';

		// Set custom drag image to prevent fading
		const targetElement = event.currentTarget as HTMLElement;
		// Use the original element if you don't mind it being invisible
		const dragImage = targetElement.closest('li'); // Get the parent li element for the drag image
		if (dragImage && event.dataTransfer) {
			event.dataTransfer.setDragImage(dragImage, 10, 10); // Use the li element as the drag image
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(event: DragEvent, sectionIndex: number, itemIndex: number) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		if (draggedSectionIndex === sectionIndex && draggedItemIndex !== null) {
			const draggedOverItem = formItems[sectionIndex].items[itemIndex];
			const draggedItem = formItems[draggedSectionIndex].items[draggedItemIndex];

			if (draggedItem && draggedOverItem && draggedItem.id !== draggedOverItem.id) {
				const newItems = [...formItems[sectionIndex].items];
				const oldIndex = newItems.findIndex((item) => item.id === draggedItem.id);
				const newIndex = newItems.findIndex((item) => item.id === draggedOverItem.id);

				if (oldIndex > -1 && newIndex > -1) {
					const [movedItem] = newItems.splice(oldIndex, 1);
					newItems.splice(newIndex, 0, movedItem);

					formItems = formItems.map((sec, sIdx) =>
						sIdx === sectionIndex ? { ...sec, items: newItems } : sec
					);
					draggedItemIndex = newIndex; // Update the index of the dragged item
				}
			}
		}
	}

	function handleDrop(sectionIndex: number, dropIndex: number) {
		// No specific logic needed here as reordering happens in handleDragOver
		// This function is mainly to allow the drop to happen (by preventing default in dragOver)
		// and to reset the dragging state.
		draggedSectionIndex = null;
		draggedItemIndex = null;
		isDragging = false; // Reset dragging state after successful drop
	}

	function handleDragEnd() {
		// This event fires after the drag operation has finished (either dropped or cancelled)
		isDragging = false; // Ensure isDragging is reset
		draggedSectionIndex = null;
		draggedItemIndex = null;
	}

	// SECTION / ITEM operations (no change here)
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

	// Background settings state
	let useGradient = data.backgroundSettings?.[0]?.useGradient ?? false;
	let currentBackgroundColor = data.backgroundSettings?.[0]?.backgroundColor ?? '#ffffff';
	let gradientDirection = data.backgroundSettings?.[0]?.gradientDirection ?? 'to-r';
	let gradientColor1 = data.backgroundSettings?.[0]?.gradientColor1 ?? '#ff0031';
	let gradientColor2 = data.backgroundSettings?.[0]?.gradientColor2 ?? '#7e5bef';

	// Dynamic background style generation (no change here)
	let backgroundStyle = '';
	$: {
		if (useGradient) {
			const directions: Record<string, string> = {
				'to-t': 'to top',
				'to-tr': 'to top right',
				'to-r': 'to right',
				'to-br': 'to bottom right',
				'to-b': 'to bottom',
				'to-bl': 'to bottom left',
				'to-l': 'to left',
				'to-tl': 'to top left'
			};
			const dir = directions[gradientDirection] || 'to right';
			backgroundStyle = `background: linear-gradient(${dir}, ${gradientColor1}, ${gradientColor2});`;
		} else {
			backgroundStyle = `background: ${currentBackgroundColor};`;
		}
	}

	// Reactive JSON for hidden input (no change here)
	let formData = '';
	$: formData = JSON.stringify(
		{
			user: {
				email: usermail,
				form_name: form_name,
				form_hash: form_hash,
				closeTime: closeTime
			},
			formItems,
			backgroundSettings: [
				{
					useGradient,
					backgroundColor: currentBackgroundColor,
					gradientDirection,
					gradientColor1,
					gradientColor2
				}
			]
		},
		null,
		2
	);
    $:copied = false;
	async function copyText() {
		try {
			await navigator.clipboard.writeText('https://forms.mlclubnits.com/' + form_hash);
			copied = true;
			setTimeout(() => (copied = false), 2000); // Reset "Copied" message after 2 seconds
		} catch (err) {
			console.error('Failed to copy!', err);
		}
	}

	// If you want to re-fetch server data after success: (no change here)
	$: if (browser && form?.success) {
		// console.log('Form saved; you may reload or trust local state is current.');
	}
</script>

<section class="flex w-full flex-col items-center p-4">
	<div class="fixed top-0 -z-1 h-screen w-screen" style={backgroundStyle}></div>
	<div class="flex w-full flex-col justify-between md:flex-row">
		<input
			type="text"
			class="w-auto border-0 border-b border-b-neutral-600 bg-transparent pb-1 text-2xl font-bold"
			bind:value={data.form_name}
			required
		/>
		<input
			type="datetime-local"
			class="mt-2 w-auto rounded border border-neutral-300 bg-white px-3 py-1 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
			bind:value={closeTime}
			on:change={(e) => {
				closeTime = (e.target as HTMLInputElement).value;
			}}
			placeholder="Close Time"
		/>
	</div>
	<button on:click={copyText} class="max-w-screen mt-3 mx-5 cursor-pointer flex gap-2 rounded-md bg-gray-200 px-5 pt-2 pb-3">
		<span class="max-w-auto overflow-auto">https://forms.mlclubnits.com/{form_hash}</span><Copy class="mt-1 h-5" />
	</button>
	{#if copied}
		Copied!
	{/if}

	<div class="mt-2 mb-4 flex w-full flex-col items-center justify-end gap-4 md:flex-row">
		<label class="flex items-center space-x-2">
			<input type="checkbox" bind:checked={useGradient} />
			<span>Use Gradient</span>
		</label>

		{#if useGradient}
			<select bind:value={gradientDirection} class="rounded border bg-white px-2 py-1">
				<option value="to-t">To Top</option>
				<option value="to-tr">To Top Right</option>
				<option value="to-r">To Right</option>
				<option value="to-br">To Bottom Right</option>
				<option value="to-b">To Bottom</option>
				<option value="to-bl">To Bottom Left</option>
				<option value="to-l">To Left</option>
				<option value="to-tl">To Top Left</option>
			</select>
			<input type="color" bind:value={gradientColor1} />
			<input type="color" bind:value={gradientColor2} />
		{:else}
			<input type="color" bind:value={currentBackgroundColor} />
		{/if}
		<form method="POST">
			<input type="hidden" name="formItems" value={formData} />

			<button
				type="submit"
				class="mb-6 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
			>
				Publish Form
			</button>
		</form>
	</div>

	{#if form?.error}
		<p class="mb-4 text-red-600">Error: {form.error}</p>
	{/if}
	{#if form?.success}
		<div class="mb-4 !text-green-600">Form saved successfully.</div>
	{/if}

	<form class="flex w-full flex-col" method="POST">
		{#each formItems as section, sectionIndex (section.id)}
			<div
				class="relative mb-6 flex w-full flex-col gap-2 rounded-lg border bg-[#f4f4f4b8] p-16 backdrop-blur-xs focus:border-0 focus:ring-0"
			>
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
					class="w-full border-0 border-b bg-transparent pb-1 text-xl font-semibold outline-0 focus:bg-white"
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
					class="mt-1 border-0 border-b text-gray-700"
					value={section.description}
					on:input={(e) => {
						const v = (e.target as HTMLInputElement).value;
						formItems = formItems.map((sec, idx) =>
							idx === sectionIndex ? { ...sec, description: v } : sec
						);
					}}
				/>

				{#if section.items.length > 0}
					<ul class="mt-4 space-y-4">
						{#each section.items as item, itemIndex (item.id)}
							<li
								class="relative flex flex-col rounded-lg bg-white px-10 py-7 shadow-sm transition-all duration-300
                                {isDragging && draggedItemIndex === itemIndex
									? 'opacity-100'
									: 'opacity-100'}"
								on:dragover={(e) => handleDragOver(e, sectionIndex, itemIndex)}
								on:drop={() => handleDrop(sectionIndex, itemIndex)}
								on:dragleave={() => {}}
								on:dragend={handleDragEnd}
							>
								<div
									class="-mt-7 mb-7 flex w-full cursor-grab justify-center pt-3 pb-2 text-gray-400 hover:text-gray-600"
									draggable="true"
									role="button"
									tabindex="0"
									on:dragstart={(e) => handleDragStart(e, sectionIndex, itemIndex)}
								>
									<GripHorizontal size={20} />
								</div>

								<span class="top-2 left-2 flex text-gray-500">
									{itemIndex + 1}.&nbsp;
									<input
										id="drag-item"
										type="text"
										class="mx-2 mb-2 w-full border-b bg-transparent pb-1 {inputElemDisplay}"
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
								</span>

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
			class="mb-6 cursor-pointer rounded px-4 py-2 text-white hover:bg-[rgba(20,20,20,0.38)]"
			on:click={addSection}
		>
			Add Section
		</button>
	</form>

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
