# This file was auto-generated, do not edit it directly.
# Instead run bin/update_build_scripts from
# https://github.com/overleaf/internal/

FROM node:22.17.0 AS base

WORKDIR /overleaf/services/history-v1
COPY services/history-v1/install_deps.sh /overleaf/services/history-v1/
RUN chmod 0755 ./install_deps.sh && ./install_deps.sh

# Google Cloud Storage needs a writable $HOME/.config for resumable uploads
# (see https://googleapis.dev/nodejs/storage/latest/File.html#createWriteStream)
RUN mkdir /home/node/.config && chown node:node /home/node/.config

# fs persistor needs a writable folder as a target for the mounted volume
RUN mkdir /buckets && chown node:node /buckets

FROM base AS app

COPY package.json package-lock.json /overleaf/
COPY services/history-v1/package.json /overleaf/services/history-v1/
COPY libraries/ /overleaf/libraries/
COPY patches/ /overleaf/patches/

RUN cd /overleaf && npm ci --quiet

COPY services/history-v1/ /overleaf/services/history-v1/

FROM app
USER node

CMD ["node", "--expose-gc", "app.js"]
