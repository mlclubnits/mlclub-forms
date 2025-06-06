<script lang="ts">
	let draggedIndex: number | null = null;

	function handleDragStart(index: number) {
		draggedIndex = index;
	}

	function handleDrop(index: number) {
		if (draggedIndex === null || draggedIndex === index) return;

		const updated = [...items];
		const [moved] = updated.splice(draggedIndex, 1);
		updated.splice(index, 0, moved);

		items = updated;
		draggedIndex = null;
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault(); // This allows dropping
	}

	$: formItems = [
		{
			id: 1,
			title: 'Section 1',
			description: 'This is the first section',
			items: items
		}
	];

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

	let items: Item[] = [];
	function addItem(type: string = '', optionType: string = '', options: string[] = []) {
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
		items = [...items, newItem];
	}

	function addSection() {
		// Example: Add a new section to formItems (currently not used in UI)
		formItems = [
			...formItems,
			{
				id: Date.now(),
				title: `Section ${formItems.length + 1}`,
				description: `This is section ${formItems.length + 1}`,
				items: []
			}
		];
	}

	function addOption(itemIndex: number) {
		const updated = [...items];
		updated[itemIndex] = {
			...updated[itemIndex],
			options: [...updated[itemIndex].options, `Option ${updated[itemIndex].options.length + 1}`]
		};
		items = updated;
	}

	function deleteOption(itemIndex: number, optIndex: number) {
		const updated = [...items];
		const newOptions = [...updated[itemIndex].options];
		newOptions.splice(optIndex, 1);
		updated[itemIndex] = {
			...updated[itemIndex],
			options: newOptions
		};
		items = updated;
	}

	function deleteItem(index: number) {
		const updated = [...items];
		updated.splice(index, 1);
		items = updated;
	}
</script>

<section class="flex w-full flex-col items-center p-4">
	<h1 class="mb-4 text-2xl font-bold">Drag and Drop Form Builder</h1>
	<form action="">
		{#each formItems as section, index (section.id)}
			<div class="mb-4">
				<input class="text-xl font-semibold" value={section.title} />
				<p>{section.description}</p>
			</div>
			{#if section.items.length > 0}
				<ul>
					{#each items as item, index (item.id)}
						<li
							draggable="true"
							ondragstart={() => handleDragStart(index)}
							ondragover={handleDragOver}
							ondrop={() => handleDrop(index)}
						>
							<input type="text" value={item.question} />
							{#if item.itemType === 'option'}
								{#each item.options as option, optIndex}
									<br />
									<label>
										<input type={item.optionType} name={item.question} />
										<input value={option} />
										<button type="button" onclick={() => deleteOption(index, optIndex)}
											>Delete option</button
										>
									</label>
								{/each}
								<select
									name="optiontype"
									id=""
									onchange={(e) => {
										const updated = [...items];
										updated[index] = {
											...updated[index],
											optionType: (e.target as HTMLSelectElement).value
										};
										items = updated;
									}}
								>
									<option value="radio">Radio</option>
									<option value="checkbox">Checkbox</option>
								</select>
								<button type="button" onclick={() => addOption(index)}>Add Option</button>
							{:else if item.itemType === 'text'}
								<label>
									<input type={item.inputType} placeholder={item.placeholder} />
								</label>
							{:else}
								<p>Unknown item type: {item.itemType}</p>
							{/if}
							{#if item.description}
								<p>{item.description}</p>
							{/if}
							{#if item.photo}
								<img src={item.photo} alt="Item" />
							{/if}
							<button type="button" onclick={() => deleteItem(index)}>Delete Item</button>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No items in this section.</p>
			{/if}
		{/each}

		<button onclick={() => addItem('text')}>Add Text Item</button>
		<button onclick={() => addItem('option', 'radio', ['Option A', 'Option B'])}
			>Add Option Item</button
		>
		<button type="button" onclick={() => addSection()}>Add section</button>
	</form>
</section>

<style>
	ul {
		padding: 0;
		list-style-type: none;
		width: 300px;
	}

	li {
		padding: 1rem;
		margin: 0.5rem 0;
		background-color: #f2f2f2;
		border: 1px solid #ccc;
		cursor: grab;
		transition: background 0.2s;
	}

	li:active {
		cursor: grabbing;
	}
</style>
