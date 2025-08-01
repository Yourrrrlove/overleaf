all: test-e2e

# We are updating the docker compose config via the host-admin service.
# The host-admin service is running inside docker and has its own file-system layout.
# We need to have both file-system layouts agree on the path for the docker compose project.
# Notable the container labels com.docker.compose.project.working_dir and com.docker.compose.project.config_files need to match when creating containers from the docker host (how you started things) and from host-admin (how tests reconfigure the instance).
export PWD = $(shell pwd)

export TEX_LIVE_DOCKER_IMAGE ?= us-east1-docker.pkg.dev/overleaf-ops/ol-docker/texlive-full:2023.1
export ALL_TEX_LIVE_DOCKER_IMAGES ?= us-east1-docker.pkg.dev/overleaf-ops/ol-docker/texlive-full:2023.1,us-east1-docker.pkg.dev/overleaf-ops/ol-docker/texlive-full:2022.1
export IMAGE_TAG_PRO ?= us-east1-docker.pkg.dev/overleaf-ops/ol-docker/pro:latest
export CYPRESS_SHARD ?=
export COMPOSE_PROJECT_NAME ?= test
export DOCKER_USER := $(shell id -u):$(shell id -g)

test-e2e-native:
	docker compose -f docker-compose.yml -f docker-compose.native.yml up --no-log-prefix sharelatex host-admin -d
	CYPRESS_HOST_ADMIN_URL='http://localhost:8081' \
	CYPRESS_SAML_URL='http://localhost:8082' \
	CYPRESS_MAILTRAP_URL='http://localhost:8083' \
		npm run cypress:open

test-e2e:
	docker compose build host-admin
	docker compose up -d host-admin
	docker compose up --no-log-prefix --exit-code-from=e2e e2e

test-e2e-open:
	docker compose up -d host-admin
	docker compose up --no-log-prefix --exit-code-from=e2e-open e2e-open host-admin

clean:
	docker compose down --volumes --timeout 0

prefetch: prefetch_default
prefetch_default: prefetch_default_compose
prefetch_default_compose:
	docker compose pull e2e mongo redis

prefetch_default: prefetch_default_compose_build
prefetch_default_compose_build:
	docker compose build host-admin

prefetch: prefetch_custom
prefetch_custom: prefetch_custom_compose_pull
prefetch_custom_compose_pull:
	docker compose pull saml ldap

prefetch_custom: prefetch_custom_texlive_2023
prefetch_custom_texlive_2023:
	docker pull us-east1-docker.pkg.dev/overleaf-ops/ol-docker/texlive-full:2023.1
	docker tag us-east1-docker.pkg.dev/overleaf-ops/ol-docker/texlive-full:2023.1 quay.io/sharelatex/texlive-full:2023.1

prefetch_custom: prefetch_custom_texlive_2022
prefetch_custom_texlive_2022:
	docker pull us-east1-docker.pkg.dev/overleaf-ops/ol-docker/texlive-full:2022.1
	docker tag us-east1-docker.pkg.dev/overleaf-ops/ol-docker/texlive-full:2022.1 quay.io/sharelatex/texlive-full:2022.1

prefetch_custom: prefetch_old_4_2
prefetch_old_4_2:
	docker pull $(IMAGE_TAG_PRO:latest=4.2)

prefetch_custom: prefetch_old_5_0
prefetch_old_5_0:
	docker pull $(IMAGE_TAG_PRO:latest=5.0.1-RC1)
	docker pull $(IMAGE_TAG_PRO:latest=5.0)

# Google Cloud Build runs on a very ancient Docker version that does not support the subdir flag.
# Use services -> mailtrap -> build -> context = https://github.com/dbck/docker-mailtrap.git#v1.5.0:build in docker-compose.yml eventually.
prefetch_default_compose_build: build_mailtrap
build_mailtrap:
	git clone https://github.com/dbck/docker-mailtrap.git || true && cd docker-mailtrap && git checkout v1.5.0
	docker build -t mailtrap docker-mailtrap/build

.PHONY: test-e2e test-e2e-open
