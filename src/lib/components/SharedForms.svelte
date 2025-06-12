<script lang="ts">
	import { supabase } from '$lib/supabase';
	import SharedFormCard from './SharedFormCard.svelte';

	const { usermail } = $props<{ usermail: string }>();
	let fetchedData: any[] = $state([]);

	async function fetchSharedForms() {
		const { data, error } = await supabase
			.from('forms-access-relation')
			.select(
				`
				form_hash,
				forms (
					id,
					form_name,
					creator_email,
					form_hash,
					backgroundSettings,
					created_at
				)
			`
			)
			.eq('shared_email', usermail);

		if (error) {
			console.error('Error fetching shared forms:', error.message);
			fetchedData = [];
			return;
		}

		// Flatten and extract the forms info
		fetchedData = data.map((item) => item.forms);
	}

	fetchSharedForms();
</script>

{#if fetchedData.length > 0}
	<div
		class="grid w-full grid-cols-1 gap-4 text-center text-gray-600 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
	>
		{#each fetchedData as dt (dt.id)}
			<SharedFormCard
				id={dt.id}
				formName={dt.form_name}
				createdAt={dt.created_at}
				formHash={dt.form_hash}
				backgroundSettings={dt.backgroundSettings}
				userEmail={usermail}
				creatorEmail={dt.creator_email}
			/>
		{/each}
	</div>
{:else}
	<div class="flex h-44 w-auto items-center justify-center text-gray-600">No shared forms found.</div>
{/if}
