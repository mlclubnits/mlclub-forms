<script lang="ts">
	import Logo from '$lib/assets/ml_logo.jpg';
	import type { User } from '$lib/types';
	import { onMount } from 'svelte';
	// Helper function to get a cookie value by name
    let userdata: User | null = null;
	onMount(() => {
		function getCookie(name: string): string | null {
			const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
			return match ? decodeURIComponent(match[2]) : null;
		}
        
        const userCookie = getCookie('user_data');
        if (userCookie) {
            try {
                userdata = JSON.parse(userCookie) as User;
            } catch {
                // handle invalid JSON, maybe clear cookie or fallback
                userdata = null;
            }
        }
    });
</script>

<header
	class="fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-screen-md border border-gray-100 bg-white/80 py-3 shadow backdrop-blur-lg md:top-4 md:rounded-3xl lg:max-w-screen-lg"
>
	<div class="px-4">
		<div class="flex items-center justify-between">
			<div class="flex shrink-0">
				<a aria-current="page" class="flex items-center" href="/">
					<img class="-my-2 h-15 w-auto" src={Logo} alt="" />
					<span class="-mt-1 ml-2 text-black">Former</span>
				</a>
			</div>
			<!-- <div class="hidden md:flex md:items-center md:justify-center md:gap-5">
                <a aria-current="page"
                    class="inline-block rounded-lg px-2 py-1 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                    href="#how-it-works">How it works</a>
                <a class="inline-block rounded-lg px-2 py-1 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                    href="#pricing">Pricing</a>
            </div> -->
			{#if userdata}
				<div class="hidden items-center justify-end gap-3 md:flex">
					<a
						class="inline-flex items-center justify-center rounded-xl text-blue-600 px-3 py-2 text-sm font-semibold bg-linear-0 from-sky-100 to to-teal-100 shadow-sm transition-all duration-150 hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
						href="/profile">Profile</a
					>
					<a
						class="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold bg-linear-0 from-red-200 to-yellow-200 text-red-700 shadow-sm ring-1 ring-gray-300 transition-all duration-150 ring-inset hover:bg-gray-50"
						href="/logout">Logout</a
					>
				</div>
			{:else}
				<div class="flex items-center justify-end gap-3">
					<a
						class="hidden items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 transition-all duration-150 ring-inset hover:bg-gray-50 sm:inline-flex"
						href="/auth/signup">Sign up</a
					>
					<a
						class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
						href="/auth/login">Login</a
					>
				</div>
			{/if}
		</div>
	</div>
</header>
