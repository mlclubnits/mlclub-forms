<script lang="ts">
	import { goto } from '$app/navigation';
	import { HomeCard } from '$lib';
	import SharedForms from '$lib/components/SharedForms.svelte';
	import { FileTextIcon, Forward, PlusCircle } from 'lucide-svelte';
	export let data: {
		usermail: string;
		forms: {
			id: number;
			form_name: string | null;
			created_at: string;
			creator_email: string;
			form_hash: string;
			backgroundSettings: {
				useGradient: boolean;
				backgroundColor: string;
				gradientDirection: string;
				gradientColor1: string;
				gradientColor2: string;
			};
		}[];
	};
	// console.log(data.forms.map((form) => form.backgroundSettings));

	let activeTab: 'forms' | 'shared' = 'forms';
</script>

<svelte:head>
	<title>ML CLUB NITS FORMS</title>
</svelte:head>

<div class="mb-4 ml-3 pt-4 text-xl font-bold">Create your own form here</div>

<div class="mr-3 mb-8 ml-3 flex rounded-xl bg-white p-5 shadow-md sm:w-full md:mb-0 md:w-1/3">
	<button
		type="button"
		class="m-0 flex w-full cursor-pointer gap-3 border-none bg-transparent p-0 text-left"
		on:click={() => goto('/create')}
	>
		<PlusCircle class="text-gray-600" />
		<span
			class="bg-linear-90 from-sky-600 to-violet-600 bg-clip-text font-semibold text-transparent"
		>
			Create New Form</span
		>
	</button>
</div>

<div class="mt-6 mb-6 ml-2 flex justify-center">
	<nav
		class="flex items-center space-x-1 overflow-x-auto rounded-xl bg-gray-500/6 p-1 text-sm text-gray-600 dark:bg-gray-500/20"
	>
		<button
			role="tab"
			type="button"
			class="flex h-8 items-center gap-2 rounded-lg px-5 font-medium whitespace-nowrap transition duration-200 ease-in-out outline-none"
			class:bg-white={activeTab === 'forms'}
			class:text-gray-500={activeTab === 'forms'}
			class:shadow={activeTab === 'forms'}
			class:text-zinc-500={activeTab !== 'forms'}
			aria-selected={activeTab === 'forms'}
			on:click={() => (activeTab = 'forms')}
		>
			<FileTextIcon />
			My Forms
		</button>

		<button
			role="tab"
			type="button"
			class="flex h-8 items-center rounded-lg px-5 font-medium whitespace-nowrap transition duration-200 ease-in-out outline-none"
			class:bg-white={activeTab === 'shared'}
			class:text-gray-500={activeTab === 'shared'}
			class:shadow={activeTab === 'shared'}
			class:text-zinc-500={activeTab !== 'shared'}
			aria-selected={activeTab === 'shared'}
			on:click={() => (activeTab = 'shared')}
		>
			<Forward class="" />
			Shared with me
		</button>
	</nav>
</div>

{#if activeTab === 'forms'}
	{#if data.forms.length > 0}
		<div
			class="grid grid-cols-1 gap-4 text-center text-gray-600 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
		>
			{#each data.forms as form}
				<HomeCard
					id={form.id}
					formHash={form.form_hash}
					userEmail={form.creator_email}
					formName={form.form_name ?? 'Untitled Form'}
					createdAt={form.created_at}
					backgroundSettings={form.backgroundSettings}
				/>
			{/each}
		</div>
	{:else}
		<p class="text-center text-gray-600">You haven’t created any forms yet.</p>
	{/if}
{:else}
	<div class="h-full w-full">
		<SharedForms usermail={data.usermail} />
	</div>
{/if}
