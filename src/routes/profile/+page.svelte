<script lang="ts">
	export let data;
</script>

<h1>Welcome {data.full_name || 'User'}</h1>
<p>Email: {data.email}</p>

<form method="POST" action="?/update">
	<label for="full_name">Your Name:</label>
	<input name="full_name" id="full_name" value={data.full_name} required />
	<button type="submit">Save</button>
</form>
