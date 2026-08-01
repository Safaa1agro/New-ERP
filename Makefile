.PHONY: dev build start db-up db-reset clean test

# One-Command Local Startup inside GitHub Codespaces
dev:
	npm run dev

	# Start local Supabase instance
	db-up:
		npx supabase start

		# Reset local database with fresh migrations and seed data
		db-reset:
			npx supabase db reset

			# Build frontend production bundle
			build:
				npm run build

				# Run quality checks and tests
				test:
					npm run lint && npm run test

					# Clean build assets and cache
					clean:
						rm -rf .next node_modules

						