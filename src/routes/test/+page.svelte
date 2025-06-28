<script lang="ts">
	let fileToUpload: File | null = null;
	let publicUrl = '';
	let errorMsg = '';

	function onFileChange(e: Event) {
		errorMsg = '';
		const input = e.target as HTMLInputElement;
		fileToUpload = input.files?.[0] || null;
	}

	async function uploadAnyFile() {
		errorMsg = '';
		if (!fileToUpload) {
			errorMsg = 'Select a file first!';
			return;
		}

		const formData = new FormData();
		formData.append('file', fileToUpload);
		formData.append('upload_preset', 'form_uploads');
		formData.append('folder', 'forms-platform');
		// tell Cloudinary to auto-detect resource type
		formData.append('resource_type', 'auto');

		try {
			const res = await fetch(`https://api.cloudinary.com/v1_1/db7rduqjv/auto/upload`, {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			console.log('Cloudinary response:', data);

			if (!res.ok) {
				throw new Error(data.error?.message || `Upload failed ${res.status}`);
			}

			publicUrl = data.secure_url || data.url;
		} catch (err) {
			console.error(err);
			errorMsg = err.message;
		}
	}
</script>

<input type="file" on:change={onFileChange} />
<button on:click={uploadAnyFile}>Upload File</button>

{#if errorMsg}
	<p style="color: red">{errorMsg}</p>
{/if}

{#if publicUrl}
	<p>✅ Uploaded! Public URL:</p>
	<a href={publicUrl} target="_blank" rel="noopener">{publicUrl}</a>
{/if}
