<script lang="ts">
	let { data } = $props();
	let { userdata } = $derived(data);
</script>

Hi {userdata?.email || 'Guest'}!

{#if userdata}
	<p>Welcome back, {userdata.full_name || 'User'}!</p>
{:else}
	<p>Please log in or sign up.</p>
{/if}

{#if userdata?.email}
	<p>Welcome, {userdata.email}!</p>
	<p>Your full name is {userdata.full_name || 'User'}.</p>
	<p>Welcome back!</p>
{:else}
	<p>Please log in or sign up.</p>
{/if}
Login Page or Home Page
