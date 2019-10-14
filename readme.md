# Authed.io API wrapper
[Discord](https://discord.gg/sxVvkMS)

```js
const client = require("authed.io");
```

## Set up API credentials
```js
const authed = new authed({
    id: "",
    token: "",
    secret: "",
});
```

## Examples
```js
authed.login("authed@example.com", "example", function(response) {
    console.log(response);
});
```

```js
authed.register("authed@example.com", "example", "license", function(response) {
    console.log(response);
});
```

```js
authed.generateLicence("authed.io", 1, 0, 50, function(response) {
	console.log(response);
});
```
