.PHONY: build clean test package serve update-vendor api statics
PKGS := $(shell go list ./... | grep -v /paxos/)
GOOS ?= linux
GOPATH := $(shell pwd)
GOARCH ?= amd64

all: app paxos

app: statics
	@echo "Compiling app for $(GOOS) $(GOARCH)"
	@mkdir -p build
	@GOOS=$(GOOS) GOPATH=$(GOPATH) GOARCH=$(GOARCH) go build -o build/app$(BINEXT) paxos/runner/application/app.go paxos/runner/application/socket_client.go paxos/runner/application/socket_hub.go

paxos: statics
	@echo "Compiling paxos for $(GOOS) $(GOARCH)"
	@mkdir -p build
	@GOOS=$(GOOS) GOPATH=$(GOPATH) GOARCH=$(GOARCH) go build -o build/paxos$(BINEXT) paxos/runner/paxosrunner/paxosrunner.go

clean:
	@echo "Cleaning up workspace"
	@rm -rf build
