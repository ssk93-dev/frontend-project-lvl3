install:
	npm ci
	
publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	npm test

build:
	npx webpack

start:
	npx webpack serve --open