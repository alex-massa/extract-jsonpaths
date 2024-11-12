.PHONY: install compile clean

PROGRAM_NAME := extract-jsonpaths
PLATFORM ?= linux
RUN_TESTS ?= true

install:
	npm install .

test:
	npm run test

compile: clean install
ifeq ($(RUN_TESTS), true)
	$(MAKE) test
endif
	node --experimental-sea-config sea-config.json
	cp $(shell command -v node) $(PROGRAM_NAME)
	chmod 755 $(PROGRAM_NAME)
ifeq ($(PLATFORM), mac)
	codesign --remove-signature $(PROGRAM_NAME)
	npx postject $(PROGRAM_NAME) NODE_SEA_BLOB sea-prep.blob \
		--sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
		--macho-segment-name NODE_SEA
	codesign --sign - $(PROGRAM_NAME)
else
	npx postject $(PROGRAM_NAME) NODE_SEA_BLOB sea-prep.blob \
		--sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
endif

clean:
	rm -rf node_modules
	rm -f package-lock.json
	rm -f sea-prep.blob
	rm -f $(PROGRAM_NAME)

.DEFAULT_GOAL := compile
