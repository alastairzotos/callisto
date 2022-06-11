deploy:
	if [ -z "$(tag)" ]; then \
		echo "No tag provided"; \
	else \
		helm upgrade --install callisto .helm/callisto --namespace callisto --create-namespace --set image.tag=$(tag); \
	fi
