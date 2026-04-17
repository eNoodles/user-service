# base this on the node-24 (slim sized) image
# that means NPM, node, etc. are all installed
# but will take up less disk space than a full image
FROM node:24-slim

# This is the directory on the container where our code will go -
# /usr/src/app is a typical convention..
WORKDIR /usr/src/app

# Each command becomes a layer in the image (more or less):
# if a layer changes, every layer after it must also be recompiled
# (this makes build times longer and can make the images bigger to store,
# which again makes things take longer and be more expensive ...)
# best practice: arrange layers so that "things that don't change much"
# happen before "things that change frequently!"

# Here, we're copying the package instructions over and running NPM install,
# since that (typically) doesn't change as often...
COPY package*.json ./
RUN npm install

# copy over the rest of your source code (which does change often!)
COPY . .

# The container should open port 3100:
EXPOSE 3100

# this is the command run when the image is launched
CMD ["node", "user-service.js"]