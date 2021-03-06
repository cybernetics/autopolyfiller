BIN = ./node_modules/.bin
MOCHA = $(BIN)/mocha
ISTANBUL = $(BIN)/istanbul
JSHINT = $(BIN)/jshint
JSCS = $(BIN)/jscs
COVERALLS = $(BIN)/coveralls
CODECLIMATE = $(BIN)/codeclimate

.PHONY: test
test:
	$(MOCHA) -u bdd -R spec

.PHONY: validate
validate: lint test

.PHONY: clean
clean:
	-rm -rf lib-cov
	-rm -rf html-report

.PHONY: lib-cov
lib-cov: clean
	$(ISTANBUL) instrument --complete-copy --output lib-cov --no-compact --variable global.__coverage__ lib

.PHONY: coverage
coverage: lib-cov
	AUTOPOLIFILLER_COVERAGE=1 $(MOCHA) --reporter mocha-istanbul
	@echo
	@echo Open html-report/index.html file in your browser

.PHONY: coverage_push
coverage_push: lib-cov
	@AUTOPOLIFILLER_COVERAGE=1 ISTANBUL_REPORTERS=lcovonly $(MOCHA) --reporter mocha-istanbul
	-@cat lcov.info | $(COVERALLS)
	-@cat lcov.info | $(CODECLIMATE)
	@rm -rf lib-cov lcov.info

.PHONY: travis
travis: validate coverage_push

.PHONY: lint
lint:
	$(JSHINT) .
	$(JSCS) .

.PHONY: browserify
browserify:
	./node_modules/.bin/browserify example_assets/index.js \
	    | sed 's/fs.readdirSync/fs.readdirSync \&\& fs.readdirSync/' \
	    | sed 's/this._scan(code(/[] \|\| this._scan(code(/' \
	    > ./example_assets/index.browserify.js
	./node_modules/.bin/uglifyjs ./example_assets/index.browserify.js -o ./example_assets/index.browserify.js
