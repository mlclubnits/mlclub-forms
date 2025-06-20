<script lang="ts">
	import type { PageProps } from './$types';

	// --- Props & State ---
	export let data;
	let currentSection = 0;

	// Initialize a responses array: one entry per section
	type QuestionResp = {
		textAns: string;
		uploadedDocLink: string;
		singleOption: string;
		multiOption: string[];
	};
	type SectionResp = {
		sectionId: number;
		questions: Record<number, QuestionResp>;
	};

	const defaultQuestionResp = (): QuestionResp => ({
		textAns: '',
		uploadedDocLink: '',
		singleOption: '',
		multiOption: []
	});

	// Build initial empty structure from data.form_data
	let responses: SectionResp[] = data.form_data.map(
		(section: { id: number; items: { id: number }[] }) => ({
			sectionId: section.id,
			questions: section.items.reduce(
				(map: Record<number, QuestionResp>, item: { id: number }) => {
					map[item.id] = defaultQuestionResp();
					return map;
				},
				{} as Record<number, QuestionResp>
			)
		})
	);

	// Reactive alias for easier templating
	$: section = data.form_data[currentSection];
	$: sectionResp = responses[currentSection];

	// --- Navigation & Clear ---
	function goNext() {
		if (currentSection < data.form_data.length - 1) currentSection++;
	}
	function goPrev() {
		if (currentSection > 0) currentSection--;
	}
	function clearCurrentSection() {
		// reset just this section’s responses
		responses[currentSection] = {
			sectionId: section.id,
			questions: section.items.reduce(
				(map: Record<number, QuestionResp>, item: { id: number }) => {
					map[item.id] = defaultQuestionResp();
					return map;
				},
				{} as Record<number, QuestionResp>
			)
		};
	}

	// --- Submit ---
	async function handleSubmit() {
		// build payload
		const payload = {
			user: {
				email: 'user@example.com', // replace with real
				form_hash: data.form_hash
			},
			response: responses.map((sec) => ({
				sectionId: sec.sectionId,
				questions: Object.entries(sec.questions).map(([qid, qr]) => ({
					questionId: +qid,
					...qr
				}))
			}))
		};

		const form = new FormData();
		form.append('formItems', JSON.stringify(payload));

		const res = await fetch('', { method: 'POST', body: form });
		if (res.ok) {
			alert('Submitted!');
		} else {
			console.error(await res.text());
			alert('Error—check console.');
		}
	}
	// console.log(data.backgroundSettings[0]);
	let useGradient = data.backgroundSettings[0].useGradient;
	let gradientColor1 = data.backgroundSettings[0].gradientColor1;
	let gradientColor2 = data.backgroundSettings[0].gradientColor2;
	let gradientDirection = data.backgroundSettings[0].gradientDirection;
	let backgroundColor = data.backgroundSettings[0].backgroundColor;
</script>

<h1 class="mb-6 text-2xl font-bold mt-10 text-center md:text-left">{data.form_name}</h1>
<div class="h-screen w-screen fixed -z-1 top-0 left-0" style={
		useGradient
			? `background: linear-gradient(${gradientColor1}, ${gradientColor2});`
			: `background-color: ${backgroundColor};`
	}></div>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
	{#key currentSection}
		<section class="rounded-lg border p-6 shadow-sm">
			<h2 class="text-lg font-semibold">{section.title}</h2>
			<p class="mb-4 text-sm text-gray-600">{section.description}</p>

			<ul class="space-y-4">
				{#each section.items as item, idx (item.id)}
					<li>
						<label class="mb-1 block text-sm font-medium" for={`item-${item.id}`}>
							{item.question}
						</label>

						{#if item.itemType === 'text'}
							<input
								id={`item-${item.id}`}
								type={item.inputType}
								placeholder={item.placeholder}
								bind:value={sectionResp.questions[item.id].textAns}
								class="w-full rounded border px-3 py-1"
							/>
						{:else if item.itemType === 'option'}
							<div class="space-y-2">
								{#each item.options as opt}
									<label class="flex items-center gap-2">
										{#if item.optionType === 'radio'}
											<input
												type="radio"
												name={`q-${item.id}`}
												value={opt}
												bind:group={sectionResp.questions[item.id].singleOption}
												class="accent-indigo-500"
											/>
										{:else if item.optionType === 'checkbox'}
											<input
												type="checkbox"
												value={opt}
												checked={sectionResp.questions[item.id].multiOption.includes(opt)}
												on:change={(e) => {
													const checked = (e.target as HTMLInputElement).checked;
													const selected = sectionResp.questions[item.id].multiOption;
													if (checked) {
														if (!selected.includes(opt)) selected.push(opt);
													} else {
														const index = selected.indexOf(opt);
														if (index !== -1) selected.splice(index, 1);
													}
												}}
												class="accent-indigo-500"
											/>
										{/if}
										<span>{opt}</span>
									</label>
								{/each}
							</div>
						{:else if item.itemType === 'image'}
							<input
								type="file"
								accept=".png,.jpg,.jpeg"
								on:change={(e) => {
									const f = (e.target as HTMLInputElement).files?.[0];
									sectionResp.questions[item.id].uploadedDocLink = f?.name ?? '';
								}}
								class="text-sm"
							/>
						{:else if item.itemType === 'document'}
							<input
								type="file"
								accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
								on:change={(e) => {
									const f = (e.target as HTMLInputElement).files?.[0];
									sectionResp.questions[item.id].uploadedDocLink = f?.name ?? '';
								}}
								class="text-sm"
							/>
						{/if}

						{#if item.description}
							<p class="mt-1 text-xs text-gray-600">{item.description}</p>
						{/if}
						{#if item.photo}
							<img src={item.photo} alt="" class="mt-2 h-24 rounded" />
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/key}

	<!-- Controls -->
	<div class="flex items-center justify-between">
		<button
			type="button"
			on:click={goPrev}
			class="rounded bg-gray-300 px-4 py-1"
			disabled={currentSection === 0}
		>
			Prev
		</button>

		<button type="button" on:click={clearCurrentSection} class="rounded bg-yellow-400 px-4 py-1">
			Clear Section
		</button>

		{#if currentSection < data.form_data.length - 1}
			<button type="button" on:click={goNext} class="rounded bg-green-500 px-4 py-1 text-white">
				Next
			</button>
		{:else}
			<button type="submit" class="rounded bg-indigo-600 px-4 py-2 text-white"> Submit </button>
		{/if}
	</div>
</form>
