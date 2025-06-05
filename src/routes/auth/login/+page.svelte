<script lang="ts">
	export let form;
</script>

<form method="POST">
	<input name="email" type="email" placeholder="Email" required />
	<input name="password" type="password" placeholder="Password" required />
	<button type="submit">Login</button>
</form>

{#if form?.message}
	<p>{form.message}</p>
{/if}
