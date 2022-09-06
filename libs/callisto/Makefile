publish-pckg:
	npm version patch; \
	npm publish --access=public; \
	cd ../..; \
	git add .; \
	git commit -m "feat: bump version to $$(node -p "require('./package.json').version")"; \
	git push; \