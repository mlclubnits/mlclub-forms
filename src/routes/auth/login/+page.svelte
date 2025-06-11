<script lang="ts">
	let loginEmail = '';
	let loginPassword = '';
	let showPassword = false;

	const passwordPattern = /^(?=.*[A-Z])(?=.*\W).+$/;

	function login(event: Event) {
		event.preventDefault();
		if (!loginEmail || !loginPassword) {
			alert('Please fill in all fields.');
			return;
		}
		if (!passwordPattern.test(loginPassword)) {
			alert('Password does not meet requirements.');
			return;
		}
		alert('Login successful!');
		// Add your actual login logic here.
	}
	export let form;
</script>

<section class="">
	<div class="relative mx-auto flex w-full max-w-xl flex-col justify-center p-8 py-24">
		<div class="">
			<form class="w-full rounded-xl bg-white p-8 shadow-lg lg:p-10" method="POST">
				<div class="space-y-3 py-2">
					<label for="login_email" class="text-md block text-gray-700">Email</label>
					<input
						type="email"
						id="login_email"
						name="email"
						bind:value={loginEmail}
						class="text-md block h-12 w-full rounded-lg border-0 bg-gray-100 px-4 py-3 text-blue-500 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset"
						placeholder="Enter your email"
						required
					/>
					{#if !loginEmail}
						<p class="mt-1 text-sm text-red-500">Email is required</p>
					{/if}
				</div>

				<div class="space-y-3 py-2">
					<label for="login_password" class="text-md block text-gray-700">Password</label>
					<div class="relative">
						<input
							type={showPassword ? 'text' : 'password'}
							id="login_password"
							name="password"
							bind:value={loginPassword}
							class="block h-12 w-full rounded-lg border-0 bg-gray-100 px-4 py-3 text-lg text-blue-500 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset"
							placeholder="Enter your password"
							required
						/>
						<button
							type="button"
							class="text-md absolute inset-y-0 right-0 flex cursor-pointer items-center border-0 bg-transparent pr-4 text-gray-400 focus:outline-none"
							aria-pressed={showPassword}
							aria-label={showPassword ? 'Hide password' : 'Show password'}
							on:click={() => (showPassword = !showPassword)}
						>
							{showPassword ? 'Hide' : 'Show'}
						</button>
					</div>
					<p class="mt-1 text-sm text-gray-500">
						Password must contain at least one capital letter and a special character.
					</p>
					{#if loginPassword && !passwordPattern.test(loginPassword)}
						<p class="mt-1 text-sm text-red-500">Password does not meet requirements</p>
					{/if}
					{#if form?.message}
						<p>{form.message}</p>
					{/if}
				</div>

				<div class="mt-4">
					<button
						type="submit"
						class="text-md h-10 w-full rounded-full bg-blue-600 px-6 py-1 font-semibold text-white hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						Login
					</button>
				</div>
			</form>
		</div>
	</div>
</section>
