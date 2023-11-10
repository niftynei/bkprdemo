## Core Lightning Bookkeeper Demo

This is a very basic demo of how to use commando (lnsocket) to pull data from your node, directly from 
a webapp.

Note that it uses insecure web-sockets. You'll need to figure out a proxy to ship it to prod. It will work
without issues on localhost.

## To run:

You'll need a running Core-Lightning node that you can access via a websocket. You'll also need a rune
for that node. Here's how to generate them.

### To Setup Your CLN node

You'll need a websocket turned on. You can do this by adding the following to your `config` file.

```config
bind-addr=ws:0.0.0.0:7777
```

You'll need to restart your node after updating your websocket port.

Next you'll need a rune token which will let your webapp call bookkeeper commands. Here's
the core-lightning command which will give you this.

```sh
lightning-cli createrune restrictions='[["method^bkpr-"]]'
```

This should return the following. You'll need the `rune` for this app to work.


	{
	   "rune": "FyWWWGBPSf_lq8OZcJV2CcAyjr2888kyu2848qCoY4abs9MTImbWV0aG9kXmJr828t",
	   "unique_id": "12"
	}


### To Setup the Demo

In demo.js, you need to fill in three pieces of data from your core-lightning node.

```javascript
const NODE_ID = "";
const WEBSOCKET_ADDR = "ws://";
const RUNE = "";
```

The id of your node, which you can get from `lightning-cli getinfo | jq .id`

The clearnet address to reach your node on the websocket, plus socket.

     "address": [
      {
         "type": "ipv4",
         "address": "108.171.88.101",
         "port": 6666
      },

Note that currently (as of CLN 23.11) the websocket port isn't shown in the address. You'll need to use whatever you
set in the previous section. Mine is on port 7777.

Finally, you'll need the rune you generated above.

Here's what a completed/setup looks like, using example data.

```javascript
const NODE_ID = "03cda6c5c966fcf61d121e3a70e03a1ce9eeeea024b26ea666ce974d43b242e637";
const WEBSOCKET_ADDR = "ws://108.171.88.101:7777";
const RUNE = "FyWWWGBPSf_lq8OZcJV2CcAyjr2888kyu2848qCoY4abs9MTImbWV0aG9kXmJr828t";
```

### To Run the Demo

Once this data is filled in, you're ready to run the app.  The easiest thing to do
is use a python server and visit the provided localhost address.

```sh
	python3 -m http.server
```
