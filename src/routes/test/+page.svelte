<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	let text: string = 'Hello from Svelte!';
	let qrCodeDataUrl: string = '';

	// Generate QR Code
	const generateQRCode = async () => {
		try {
			qrCodeDataUrl = await QRCode.toDataURL(text);
		} catch (err) {
			console.error('Failed to generate QR Code', err);
		}
	};

	// Initial QR generation
	onMount(generateQRCode);
</script>

<div class="mx-auto max-w-md p-4 text-center">
	<h2 class="mb-2 text-lg font-semibold">QR Code Generator</h2>

	<input
		type="text"
		bind:value={text}
		on:input={generateQRCode}
		class="mb-4 w-full rounded border p-2"
		placeholder="Enter text"
	/>

	{#if qrCodeDataUrl}
		<img src={qrCodeDataUrl} alt="QR Code" class="mx-auto" />
	{/if}
</div>

<style>
	input {
		font-size: 1rem;
	}
</style>
