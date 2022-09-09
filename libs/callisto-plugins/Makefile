# NOTE: Update callisto-manager/src/commands/plugin/templates/package.json.ts dependency version after running this

publish-pckg:
	npm version patch; \
	npm publish --access=public; \
	cd ../..; \
	git add .; \
	git commit -m "feat: bump version to $$(node -p "require('./package.json').version")"; \
	git push; \
	echo "Don't forget to update callisto-manager/src/commands/plugin/templates/package.json.ts dependency version"