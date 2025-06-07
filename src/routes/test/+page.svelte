<script lang="ts">
	import { Trash2 } from 'lucide-svelte';

	export let data: { userdata?: { email?: string; full_name?: string } } = {};
	console.log(data.userdata?.email);
	let usermail = data.userdata?.email || 'Guest';
	let datetime = Number(new Date());
	function randomString(length: number): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-~_';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}
	let formData = JSON.stringify(
		{
			user: {
				email: usermail,
				full_name: data.userdata?.full_name || 'Guest User',
				datetime: datetime,
				random: randomString(20)
			},
			formItems: []
		},
		null,
		2
	);

	// Predefined interfaces (do not modify)
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

	// Start with a single default section
	let formItems: Section[] = [
		{
			id: 1,
			title: 'Section Title',
			description: 'This is the first section',
			items: []
		}
	];

	let draggedSectionIndex: number | null = null;
	let draggedItemIndex: number | null = null;

	// --------------------
	// DRAG & DROP HANDLERS
	// --------------------
	function handleDragStart(sectionIndex: number, itemIndex: number) {
		draggedSectionIndex = sectionIndex;
		draggedItemIndex = itemIndex;
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault(); // allow drop
	}

	function handleDrop(sectionIndex: number, dropIndex: number) {
		// Only reorder if dragging within the same section
		if (
			draggedSectionIndex === null ||
			draggedItemIndex === null ||
			sectionIndex !== draggedSectionIndex ||
			draggedItemIndex === dropIndex
		) {
			return;
		}

		// Deep‐clone the specific section and its items
		const updatedSections = formItems.map((sec, idx) => {
			if (idx !== sectionIndex) return sec;
			const clonedItems = sec.items.map((it) => ({ ...it, options: [...it.options] }));
			return { ...sec, items: clonedItems };
		});

		const sectionToModify = {
			...updatedSections[sectionIndex],
			items: [...updatedSections[sectionIndex].items]
		};
		const movedItem = sectionToModify.items.splice(draggedItemIndex, 1)[0];
		sectionToModify.items.splice(dropIndex, 0, movedItem);
		updatedSections[sectionIndex] = sectionToModify;

		formItems = updatedSections;
		draggedSectionIndex = null;
		draggedItemIndex = null;
	}

	// -------------------------
	// SECTION / ITEM OPERATIONS
	// -------------------------
	function addSection() {
		const newSection: Section = {
			id: Date.now(),
			title: `Section Title`,
			description: `This is section Description`,
			items: []
		};
		formItems = [...formItems, newSection];
	}

	function deleteSection(sectionIndex: number) {
		const updatedSections = formItems.map((sec) => ({
			...sec,
			items: sec.items.map((it) => ({ ...it, options: [...it.options] }))
		}));
		updatedSections.splice(sectionIndex, 1);
		formItems = updatedSections;
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
			optionType: optionType,
			options: options,
			required: false
		};

		// Clone only the targeted section and its items
		const updatedSections = formItems.map((sec, idx) => {
			if (idx !== sectionIndex) return sec;
			const clonedItems = sec.items.map((it) => ({ ...it, options: [...it.options] }));
			return { ...sec, items: [...clonedItems, newItem] };
		});

		formItems = updatedSections;
	}

	function deleteItem(sectionIndex: number, itemIndex: number) {
		const updatedSections = formItems.map((sec, idx) => {
			if (idx !== sectionIndex) return sec;
			const clonedItems = sec.items.map((it) => ({ ...it, options: [...it.options] }));
			clonedItems.splice(itemIndex, 1);
			return { ...sec, items: clonedItems };
		});

		formItems = updatedSections;
	}

	// -------------------------
	// OPTION‐TYPE ITEM HANDLERS
	// -------------------------
	function addOption(sectionIndex: number, itemIndex: number) {
		const updatedSections = formItems.map((sec, sIdx) => {
			if (sIdx !== sectionIndex) return sec;
			const clonedItems = sec.items.map((it) => ({ ...it, options: [...it.options] }));
			const targetItem = {
				...clonedItems[itemIndex],
				options: [...clonedItems[itemIndex].options]
			};
			targetItem.options.push(`Option ${targetItem.options.length + 1}`);
			clonedItems[itemIndex] = targetItem;
			return { ...sec, items: clonedItems };
		});

		formItems = updatedSections;
	}

	function deleteOption(sectionIndex: number, itemIndex: number, optIndex: number) {
		const updatedSections = formItems.map((sec, sIdx) => {
			if (sIdx !== sectionIndex) return sec;
			const clonedItems = sec.items.map((it) => ({ ...it, options: [...it.options] }));
			const targetItem = {
				...clonedItems[itemIndex],
				options: [...clonedItems[itemIndex].options]
			};
			targetItem.options.splice(optIndex, 1);
			clonedItems[itemIndex] = targetItem;
			return { ...sec, items: clonedItems };
		});

		formItems = updatedSections;
	}

	// -------------------------
	// REACTIVE JSON OUTPUT
	// -------------------------
	// formData is always up-to-date with formItems
	$: formData = JSON.stringify(
		{
			user: {
				email: usermail,
				full_name: data.userdata?.full_name || 'Guest User',
				closeTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
				random: randomString(20),
			},
			formItems
		},
		null,
		2
	);
</script>

<section class="flex w-full flex-col items-center p-4">
	<h1 class="mb-4 text-2xl font-bold">Drag and Drop Form Builder</h1>

	<!-- ========== MAIN FORM ========== -->
	<!-- Wrap everything in one <form method="POST">. 
	     Only “Publish Form” is type="submit" -->
	<form method="POST">
		<!-- Hidden input to send JSON -->
		<input type="hidden" name="formItems" value={formData} />

		{#each formItems as section, sectionIndex (section.id)}
			<div class="mb-6 flex flex-col w-full gap-2 rounded-lg border bg-amber-100 p-4 relative">
				<!-- [Delete Section] icon (only if >1 section) -->
				{#if formItems.length > 1}
					<button
						type="button"
						class="absolute top-2 right-2 rounded px-2 py-1"
						onclick={() => deleteSection(sectionIndex)}
					>
						<Trash2 class="text-red-500 hover:text-red-600" />
					</button>
				{/if}

				<!-- Section Title & Description -->
				<input
					type="text"
					class="w-full border-b bg-transparent pb-1 text-xl font-semibold"
					value={section.title}
					oninput={(e) => {
						const updatedSections = formItems.map((sec, idx) =>
							idx === sectionIndex
								? { ...sec, title: (e.target as HTMLInputElement).value }
								: sec
						);
						formItems = updatedSections;
					}}
				/>
				<input
					type="text"
					class="mt-1 text-gray-700"
					value={section.description}
					oninput={(e) => {
						const updatedSections = formItems.map((sec, idx) =>
							idx === sectionIndex
								? { ...sec, description: (e.target as HTMLInputElement).value }
								: sec
						);
						formItems = updatedSections;
					}}
				/>

				<!-- ITEM LIST -->
				{#if section.items.length > 0}
					<ul>
						{#each section.items as item, itemIndex (item.id)}
							<li
								class="relative mb-2 cursor-grab rounded bg-white p-3 shadow-sm transition-colors hover:bg-gray-50 active:cursor-grabbing"
								draggable="true"
								ondragstart={() => handleDragStart(sectionIndex, itemIndex)}
								ondragover={handleDragOver}
								ondrop={() => handleDrop(sectionIndex, itemIndex)}
							>
								<!-- Question Text -->
								{itemIndex + 1}.&nbsp;
								<input
									type="text"
									class="mb-2 w-full border-b bg-transparent pb-1"
									value={item.question}
									oninput={(e) => {
										const updatedSections = formItems.map((sec, sIdx) => {
											if (sIdx !== sectionIndex) return sec;
											const clonedItems = sec.items.map((it) => ({
												...it,
												options: [...it.options]
											}));
											const targetItem = {
												...clonedItems[itemIndex],
												options: [...clonedItems[itemIndex].options],
												question: (e.target as HTMLInputElement).value
											};
											clonedItems[itemIndex] = targetItem;
											return { ...sec, items: clonedItems };
										});
										formItems = updatedSections;
									}}
								/>

								<!-- OPTION‐TYPE ITEMS -->
								{#if item.itemType === 'option'}
									{#each item.options as option, optIndex}
										<div class="flex items-center space-x-2">
											<input
												type={item.optionType}
												name={'opt-' + item.id}
											/>
											<input
												type="text"
												class="flex-1 border-b bg-transparent pb-1"
												value={option}
												oninput={(e) => {
													const updatedSections = formItems.map((sec, sIdx) => {
														if (sIdx !== sectionIndex) return sec;
														const clonedItems = sec.items.map((it) => ({
															...it,
															options: [...it.options]
														}));
														const targetItem = {
															...clonedItems[itemIndex],
															options: [...clonedItems[itemIndex].options]
														};
														targetItem.options[optIndex] = (e.target as HTMLInputElement).value;
														clonedItems[itemIndex] = targetItem;
														return { ...sec, items: clonedItems };
													});
													formItems = updatedSections;
												}}
											/>
											<button
												type="button"
												class="text-red-500 hover:text-red-700"
												onclick={() =>
													deleteOption(sectionIndex, itemIndex, optIndex)
												}
											>
												Delete
											</button>
										</div>
									{/each}

									<div class="mt-2 flex items-center space-x-2">
										<select
											value={item.optionType}
											onchange={(e) => {
												const newType = (e.target as HTMLSelectElement).value;
												const updatedSections = formItems.map((sec, sIdx) => {
													if (sIdx !== sectionIndex) return sec;
													const clonedItems = sec.items.map((it) => ({
														...it,
														options: [...it.options]
													}));
													const targetItem = {
														...clonedItems[itemIndex],
														options: [...clonedItems[itemIndex].options],
														optionType: newType
													};
													clonedItems[itemIndex] = targetItem;
													return { ...sec, items: clonedItems };
												});
												formItems = updatedSections;
											}}
											class="rounded border bg-white px-2 py-1"
										>
											<option value="radio">Radio</option>
											<option value="checkbox">Checkbox</option>
										</select>
										<button
											type="button"
											class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
											onclick={() => addOption(sectionIndex, itemIndex)}
										>
											Add Option
										</button>
									</div>
								{:else if item.itemType === 'text'}
									<input
										type="text"
										class="mb-2 w-full border-b bg-transparent pb-1"
										value={item.question}
										oninput={(e) => {
											const updatedSections = formItems.map((sec, sIdx) => {
												if (sIdx !== sectionIndex) return sec;
												const clonedItems = sec.items.map((it) => ({
													...it,
													options: [...it.options]
												}));
												const targetItem = {
													...clonedItems[itemIndex],
													options: [...clonedItems[itemIndex].options],
													question: (e.target as HTMLInputElement).value
												};
												clonedItems[itemIndex] = targetItem;
												return { ...sec, items: clonedItems };
											});
											formItems = updatedSections;
										}}
									/>
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

								<!-- Optional Description & Photo -->
								{#if item.description}
									<p class="mt-2 text-gray-600">{item.description}</p>
								{/if}
								{#if item.photo}
									<img
										src={item.photo}
										alt="Item"
										class="mt-2 h-24 w-auto object-cover"
									/>
								{/if}

								<!-- DELETE ITEM BUTTON -->
								<button
									type="button"
									class="absolute top-2 right-2 text-red-500 hover:text-red-700"
									onclick={() => deleteItem(sectionIndex, itemIndex)}
								>
									Delete Item
								</button>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="mb-4 text-gray-600">No items in this section.</p>
				{/if}
				<!-- ADD ITEM BUTTONS -->
				<div class="mt-4 flex space-x-2">
					<button
						type="button"
						class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
						onclick={() => addItem(sectionIndex, 'text')}
					>
						Add Text Item
					</button>
					<button
						type="button"
						class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
						onclick={() =>
							addItem(sectionIndex, 'option', 'radio', ['Option A', 'Option B'])
						}
					>
						Add Option Item
					</button>
				</div>
			</div>
		{/each}

		<!-- ADD SECTION BUTTON -->
		<button
			type="button"
			class="mb-6 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
			onclick={addSection}
		>
			Add Section
		</button>

		<!-- PUBLISH FORM (this is the only submit) -->
		<button
			type="submit"
			class="mb-6 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
		>
			Publish Form
		</button>
	</form>

	<!-- JSON OUTPUT (for debugging) -->
	<pre class="w-full max-w-md rounded border bg-gray-100 p-4 text-sm whitespace-pre-wrap">
{formData}
	</pre>
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
