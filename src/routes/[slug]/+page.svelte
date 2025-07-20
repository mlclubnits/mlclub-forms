<script lang="ts">
	import type { PageProps } from './$types';
	import { PUBLIC_CLOUDINARY_CLOUD_NAME } from '$env/static/public';

	export let data;
	let currentSection = 0;

	type QuestionResp = {
		textAns: string;
		uploadedDocLink: string;
		uploadedFileId: string;
		isUploading: boolean;
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
		uploadedFileId: '',
		isUploading: false,
		singleOption: '',
		multiOption: []
	});

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

	$: section = data.form_data[currentSection];
	$: sectionResp = responses[currentSection];

	function goNext() {
		if (currentSection < data.form_data.length - 1) currentSection++;
	}
	function goPrev() {
		if (currentSection > 0) currentSection--;
	}
	function clearCurrentSection() {
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

	let fileToUpload: File | null = null;
	let publicUrl = '';
	let errorMsg = '';

	function onFileChange(e: Event) {
		errorMsg = '';
		const input = e.target as HTMLInputElement;
		fileToUpload = input.files?.[0] || null;
	}

	async function uploadToCloudinary(file: File) {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('upload_preset', 'form_uploads');
		formData.append('folder', 'forms-platform');
		formData.append('resource_type', 'auto');

		const res = await fetch(
			`https://api.cloudinary.com/v1_1/${PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
			{
				method: 'POST',
				body: formData
			}
		);
		const data = await res.json();
		if (!res.ok) {
			throw new Error(data.error?.message || `Upload failed ${res.status}`);
		}
		return { url: data.secure_url, publicId: data.public_id };
	}

	async function handleFileChange(itemId: number, e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		errorMsg = '';

		// start spinner
		responses = responses.map((r, idx) =>
			idx === currentSection
				? {
						...r,
						questions: {
							...r.questions,
							[itemId]: {
								...r.questions[itemId],
								isUploading: true
							}
						}
					}
				: r
		);

		// delete old file
		try {
			const oldFileId = responses[currentSection].questions[itemId].uploadedFileId;
			if (oldFileId) {
				await fetch('/api/delete-file', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ publicId: oldFileId })
				});
			}
		} catch {
			// ignore
		}

		try {
			const { url, publicId } = await uploadToCloudinary(file);

			responses = responses.map((r, idx) =>
				idx === currentSection
					? {
							...r,
							questions: {
								...r.questions,
								[itemId]: {
									...r.questions[itemId],
									uploadedDocLink: url,
									uploadedFileId: publicId
								}
							}
						}
					: r
			);
		} catch (err) {
			console.error(err);
			errorMsg = err instanceof Error ? err.message : String(err);
		} finally {
			responses = responses.map((r, idx) =>
				idx === currentSection
					? {
							...r,
							questions: {
								...r.questions,
								[itemId]: {
									...r.questions[itemId],
									isUploading: false
								}
							}
						}
					: r
			);
		}
	}

	async function handleSubmit() {
		const payload = {
			user: {
				email: 'user@example.com',
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

	let useGradient = data.backgroundSettings[0].useGradient;
	let gradientColor1 = data.backgroundSettings[0].gradientColor1;
	let gradientColor2 = data.backgroundSettings[0].gradientColor2;
	let gradientDirection = data.backgroundSettings[0].gradientDirection;
	let backgroundColor = data.backgroundSettings[0].backgroundColor;
</script>

<!-- rest of your form and UI remains unchanged -->
<svelte:head>
	<title>{data.form_name} | ML Club Forms</title>
</svelte:head>
<h1 class="mt-10 mb-6 text-center text-2xl font-bold md:text-left">{data.form_name}</h1>
<div
	class="fixed top-0 left-0 -z-1 h-screen w-screen"
	style={useGradient
		? `background: linear-gradient(${gradientColor1}, ${gradientColor2});`
		: `background-color: ${backgroundColor};`}
></div>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
	{#key currentSection}
		<section class="rounded-lg border p-6 shadow-sm">
			<h2 class="text-lg font-semibold">{section.title}</h2>
			<p class="mb-4 text-sm text-gray-600">{section.description}</p>

			<ul class="space-y-4 lg:px-7 md:px-5">
				{#each section.items as item, idx (item.id)}
					<li>
						<label class="mb-1 block text-sm font-medium" for={`item-${item.id}`}>
							{item.question}
						</label>

						{#if item.itemType === 'text'}
							<input
								required
								id={`item-${item.id}`}
								type={item.inputType}
								placeholder={item.placeholder}
								bind:value={sectionResp.questions[item.id].textAns}
								class="w-full rounded px-3 py-1 bg-[#ffffff22] placeholder:text-zinc-800 border-b-2 border-0 border-[#ffffff86] focus:border-blue-500 focus:border-0 focus:outline-none focus:border-b-2"
							/>
						{:else if item.itemType === 'option'}
							<div class="space-y-2">
								{#each item.options as opt}
									<label class="flex items-center gap-2">
										{#if item.optionType === 'radio'}
											<input
												required
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
						{:else if item.itemType === 'image' || item.itemType === 'document'}
							<div class="flex flex-col space-y-2">
								<input
									type="file"
									accept={item.itemType === 'image' ? '.png,.jpg,.jpeg' : '.pdf,.doc,.docx'}
									on:change={(e) => handleFileChange(item.id, e)}
									class="text-sm"
									disabled={sectionResp.questions[item.id].isUploading}
								/>

								{#if sectionResp.questions[item.id].isUploading}
									<div class="flex items-center gap-2 text-gray-600">
										<!-- simple Tailwind spinner -->
										<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24">
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
												fill="none"
											/>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
											/>
										</svg>
										Uploading…
									</div>
								{:else if sectionResp.questions[item.id].uploadedDocLink}
									<!-- once done: show preview -->
									<div>
										<a
											href={sectionResp.questions[item.id].uploadedDocLink}
											target="_blank"
											class="text-blue-600 underline"
										>
											View Uploaded File
										</a>
									</div>
									{#if item.itemType === 'image'}
										<img
											src={sectionResp.questions[item.id].uploadedDocLink}
											alt="Preview"
											class="mt-2 max-h-40 rounded border"
										/>
									{/if}
								{/if}

								{#if errorMsg}
									<p class="text-sm text-red-500">{errorMsg}</p>
								{/if}
							</div>
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

		<button type="button" on:click={clearCurrentSection} class="rounded bg-gray-200 px-4 py-1">
			Clear Section
		</button>

		{#if currentSection < data.form_data.length - 1}
			<button type="button" on:click={goNext} class="rounded bg-green-500 px-4 py-1 text-white">
				Next
			</button>
		{:else}
			<button type="submit" class="px-5 py-2 text-base font-semibold rounded-lg " style="background-color: {data.backgroundSettings[0].gradientColor1};"> Submit </button>
		{/if}
	</div>
</form>
<style>
	button {
		cursor: pointer;
	}
</style>