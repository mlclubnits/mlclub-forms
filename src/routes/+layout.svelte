<script lang="ts">
	import { page } from '$app/state';
	import { Footer, Navbar } from '$lib';
	import '../app.css';

	let { children } = $props();
</script>

<div class="mx-7 sm:mx-10 md:mx-16 lg:mx-20 xl:mx-40 2xl:mx-52">
	{#if page.url.pathname === '/' || page.url.pathname.startsWith('/create') || page.url.pathname.startsWith('/form-builder/') || page.url.pathname.startsWith('/auth')}
		<div
			aria-hidden="true"
			class="fixed inset-0 -z-10 m-auto grid h-max w-full grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
		>
			<div
				class="h-96 bg-gradient-to-br from-teal-500 to-purple-400 blur-[106px] dark:from-blue-700"
			></div>
			<div
				class="h-96 bg-gradient-to-r from-cyan-400 to-sky-300 blur-[106px] dark:to-indigo-600"
			></div>
		</div>
		<div class="mb-24"></div>
		<Navbar />
	{/if}
	{@render children()}
</div>
<Footer />
