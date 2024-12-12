#!/bin/sh

protoc --plugin=protoc-gen-es=$(which protoc-gen-es) --es_out=.. --es_opt=import_extension=.js protocol/world.proto