<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let formData = JSON.stringify(data.form_data, null, 2);
</script>

<h1 class="mb-6 text-2xl font-bold text-gray-800">{data.form_hash}</h1>

{#each data.form_data as section, sectionIndex (section.id)}
	<div class="relative mb-8 rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
		<!-- Section Title & Description -->
		<div
			class="mb-1 w-full border-b-2 border-gray-200 px-1 pb-2 text-lg font-semibold text-gray-900"
		>
			{section.title}
		</div>
		<div class="mb-4 w-full border-b border-gray-200 px-1 text-sm text-gray-600">
			{section.description}
		</div>

		<!-- ITEM LIST -->
		{#if section.items.length > 0}
			<ul class="space-y-4">
				{#each section.items as item, itemIndex (item.id)}
					<li
						class="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm transition hover:bg-gray-100"
					>
						<!-- Question Text -->
						<label class="mb-1 block text-sm font-medium text-gray-800" for={'item-' + item.id}>
							{itemIndex + 1}.&nbsp;
							<span class="inline-block w-full border-b border-gray-300 px-1 pb-1"
								>{item.question}</span
							>
						</label>

						<!-- OPTION‐TYPE ITEMS -->
						{#if item.itemType === 'option'}
							<div class="mt-3 space-y-2">
								{#each item.options as option, optIndex}
									<div class="flex items-center gap-2">
										<input
											id={'item-' + item.id}
											type={item.optionType}
											name={'opt-' + item.id}
											class="accent-indigo-500"
										/>
										<div class="w-full border-b border-gray-200 px-1 pb-1 text-sm text-gray-700">
											{option}
										</div>
									</div>
								{/each}
							</div>
						{:else if item.itemType === 'text'}
							<div class="mt-3">
								<input
									type={item.inputType}
									placeholder={item.placeholder}
									class="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-indigo-500"
								/>
							</div>
						{:else}
							<p class="mt-2 text-sm text-red-600">Unknown item type: {item.itemType}</p>
						{/if}

						<!-- Optional Description & Photo -->
						{#if item.description}
							<p class="mt-3 text-sm text-gray-600">{item.description}</p>
						{/if}
						{#if item.photo}
							<img src={item.photo} alt="Item" class="mt-3 h-24 w-auto rounded object-cover" />
						{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-sm text-gray-500">No items in this section.</p>
		{/if}
	</div>
{/each}
